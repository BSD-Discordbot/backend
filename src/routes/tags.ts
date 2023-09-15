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
    const result = await db.insertInto('tag').values({ name: req.body.name }).returningAll().execute()
    res.send(result[0])
  })()
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    res.status(400).send()
    return
  }
  void (async () => {
    await db.deleteFrom('tag').where('id', '=', id).execute()
    res.status(200).send()
  })()
})

export default router
