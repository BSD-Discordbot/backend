import { Router } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req, res) => {
  void (async () => {
    const result = await db.selectFrom('tag').selectAll().execute()
    res.send(result)
  })()
})

router.post('/', (req, res) => {
  void (async () => {
    if (!req.body.name || typeof req.body.name !== 'string') {
      res.status(400).send()
      return
    }
    const result = await db.insertInto('tag').values({ name: req.body.name }).execute()
    res.send(result)
  })()
})

export default router
