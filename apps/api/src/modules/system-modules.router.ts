import { Router, Request, Response } from 'express';

export const usersRouter = Router();

usersRouter.get('/', (req: Request, res: Response) => {
  res.json({ users: [] });
});

export const mediaRouter = Router();
mediaRouter.post('/upload', (req: Request, res: Response) => {
  res.json({ url: '/assets/uploads/image-compressed.webp', format: 'webp' });
});

export const contactsRouter = Router();
contactsRouter.get('/', (req: Request, res: Response) => {
  res.json({ contacts: [] });
});

export const inquiriesRouter = Router();
inquiriesRouter.post('/feedback', (req: Request, res: Response) => {
  res.json({ ticketCode: 'FB-2026-9912', message: 'Phản ánh đã được ghi nhận.' });
});

export const utilitiesRouter = Router();
utilitiesRouter.get('/weather', (req: Request, res: Response) => {
  res.json({ city: 'TP.HCM', temp: 32, aqi: 45, status: 'Tốt' });
});

export const notificationsRouter = Router();
notificationsRouter.post('/send', (req: Request, res: Response) => {
  res.json({ sent: true });
});

export const analyticsRouter = Router();
analyticsRouter.get('/stats', (req: Request, res: Response) => {
  res.json({ totalViews: 125000, todayVisits: 1420, activeUsers: 48 });
});

export const auditLogsRouter = Router();
auditLogsRouter.get('/', (req: Request, res: Response) => {
  res.json({ logs: [] });
});
