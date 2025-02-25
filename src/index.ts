import { Hono } from 'hono'
import mainPageRouter from './routes/mainPage'

const app = new Hono()

app.route('/', mainPageRouter);

export default app
