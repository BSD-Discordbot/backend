import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { dbReady } from './db'
import cards from './routes/cards'
import tags from './routes/tags'
import upgrades from './routes/upgrades'
import events from './routes/event'
dotenv.config()

const app = express()
const port = 8080

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('yahoo')
})
app.use('/cards', cards)
app.use('/tags', tags)
app.use('/upgrades', upgrades)
app.use('/events', events)

export default new Promise((resolve) => {
  void dbReady().then((e) => {
    const listenServer = app.listen(port, '0.0.0.0', () => {
      console.log(`Server listening on port ${port}`)
      resolve(listenServer)
    })
  })
})
