import { Router } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req, res) => {
  void (async () => {
    const result = await db.selectFrom('card_upgrade').selectAll().execute()
    res.send(result)
  })()
})

export default router
