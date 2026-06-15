import type { Express, RequestHandler } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import pg from 'pg';
import { env, isHttps, googleConfigured } from './env';
import { prisma } from './prisma';

// 只在 session 中存 user id，反序列化時查 DB 拿最新資料。
passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user ?? false);
  } catch (err) {
    done(err as Error);
  }
});

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.APP_BASE_URL}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value ?? '';
          const avatarUrl = profile.photos?.[0]?.value;
          const name = profile.displayName || email.split('@')[0] || '使用者';
          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: { email, name, avatarUrl },
            create: { googleId: profile.id, email, name, avatarUrl },
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

  app.set('trust proxy', 1); // 正式環境走 nginx/cloudflare，需信任代理才正確判斷 https
  app.use(
    session({
      store: new PgStore({ pool, tableName: 'session', createTableIfMissing: true }),
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isHttps,
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 天
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // 開始 Google 登入
  app.get('/api/auth/google', (req, res, next) => {
    if (!googleConfigured) {
      res.status(503).json({ error: 'google_oauth_not_configured' });
      return;
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

  // Google 回呼
  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=auth' }),
    (_req, res) => res.redirect('/'),
  );

  // 登出
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: 'logout_failed' });
        return;
      }
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
      });
    });
  });

  // 目前登入者
  app.get('/api/me', (req, res) => {
    const u = req.user as
      | { id: string; email: string; name: string; avatarUrl: string | null; lineUserId: string | null }
      | undefined;
    if (!u) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    res.json({ id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl, lineUserId: u.lineUserId });
  });
}

// 之後 Phase 用：保護需要登入的 API
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
};
