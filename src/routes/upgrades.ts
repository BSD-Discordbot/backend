import { Router } from 'express'
import db from '../db'

const router = Router()

router.get('/', (req, res) => {
  void (async () => {
    const result = await db.selectFrom('card_upgrade').selectAll().execute()
    const upgrades: Record<number, Record<number, number>> = {}
    result.forEach((r) => {
      if (!(r.card in upgrades)) {
        upgrades[r.card] = {} satisfies Record<number, number>
      }
      upgrades[r.card][r.requirement] = r.amount
    })
    res.send(upgrades)
  })()
})

type UpgradeRequest = Record<number, number>

function isUpgradeRequest (value: any): value is UpgradeRequest {
  Object.entries(value).every(([requirement, amount]) => {
    if (isNaN(Number(requirement))) {
      return false
    }
    if (isNaN(Number(amount))) {
      return false
    }
    return true
  })
  return true
}

router.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  void (async () => {
    // type check
    if (isNaN(id) || !isUpgradeRequest(req.body)) {
      res.status(400).send()
      return
    }
    // logic
    await db.deleteFrom('card_upgrade').where('card', '=', id).execute()
    await db
      .insertInto('card_upgrade')
      .values(
        Object.entries(req.body).map<{
          card: number
          requirement: number
          amount: number
        }>(([requirement, amount]) => ({
          card: id,
          requirement: Number(requirement),
          amount
        }))
      )
      .execute()
    res.status(200).send()
  })()
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    res.status(400).send()
    return
  }
  void (async () => {
    await db.deleteFrom('card_upgrade').where('card', '=', id).execute()
    res.status(200).send()
  })()
})

export default router
