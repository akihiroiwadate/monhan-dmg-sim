import { Hono } from 'hono'
import mainPageRouter from './routes/frontend/mainPage'

const app = new Hono()

app.route('/', mainPageRouter);

export default app
