import { Router } from 'express'
import db from '../db'
import type Database from 'src/db/model'
import { type InsertObjectOrList } from 'kysely/dist/cjs/parser/insert-values-parser'

const router = Router()

router.get('/', (req, res) => {
  void (async () => {
    const result = await db.selectFrom('event').selectAll().execute()
    const events: Record<number, Omit<Database['event'], 'id'>> = {}

    const resultWithCards = await Promise.all(
      result.map(async (e) => {
        const cards = await db
          .selectFrom('event_has_card')
          .where('event_has_card.event', '=', e.id)
          .selectAll()
          .execute()

        return { cards: cards.map((e) => e.card), ...e }
      })
    )

    resultWithCards.forEach((e) => {
      const { id, ...event } = e
      events[id] = event
    })
    res.send(events)
  })()
})

router.post('/', (req, res) => {
  void (async () => {
    if (!req.body.name || typeof req.body.name !== 'string') {
      res.status(400).send()
      return
    }
    const data: InsertObjectOrList<Database, 'event'> = {
      name: req.body.name,
      default: req.body.default ?? false
    }
    if (req.body.end_time !== undefined) {
      data.end_time = req.body.end_time
    }
    if (req.body.start_time !== undefined) {
      data.start_time = req.body.start_time
    }
    const result = await db
      .insertInto('event')
      .values(data)
      .returning('id')
      .execute()
    res.send(JSON.stringify(result[0].id))
  })()
})

router.use('/:id', (req, res, next) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    res.status(400).send()
    return
  }
  next()
})

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  void (async () => {
    await db.deleteFrom('event').where('id', '=', id).execute()
    res.status(200).send()
  })()
})

// router.put('/:id', (req, res) => {
//   const id = Number(req.params.id)
//   void (async () => {
//     const cards = Array.from<number>(req.body)
//     if (!Array.isArray(cards) || cards.some((e) => isNaN(e))) {
//       res.status(400).send()
//       return
//     }
//     const values = cards.map(e => ({ card: e, event: id }))
//     await db.deleteFrom('event_has_card').where('event', '=', id).execute()
//     await db.insertInto('event_has_card').values(values).execute()
//     res.status(200).send()
//   })()
// })

export default router
