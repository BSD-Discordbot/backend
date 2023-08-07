import {
  type NextFunction,
  type Request,
  type Response,
  Router
} from 'express'
import fs from 'node:fs'
import { body, param, validationResult } from 'express-validator'
import multer from 'multer'
import db from '../db'

function checkErrors (req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    next()
    return
  }
  res.status(400).send({ errors: result.array() })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './cards')
  },
  filename: function (req, file, cb) {
    cb(null, req.params.id + '.png')
  }
})

const upload = multer({ storage })

const router = Router()

router.get('/', (req, res) => {
  void (async () => {
    const result = await db.selectFrom('card').selectAll().orderBy('card.card_id').execute()
    res.send(result)
  })()
})

router.all('/:id', param('id').exists().isInt({ min: 0 }), checkErrors)

router.put(
  '/:id',
  body('rarity').exists().isInt({ min: 1, max: 5 }),
  checkErrors,
  (req, res) => {
    void (async () => {
      try {
        await db.insertInto('card').values({ card_id: Number(req.params.id), rarity: req.body.rarity }).execute()
        res.sendStatus(201)
      } catch (error) {
        res.sendStatus(500)
      }
    })()
  }
)

// router.delete('/:id',
//   (req, res) => {
//     res.sendStatus(201)
//   })

router.all('/images/:id', param('id').exists().isInt({ min: 0 }), checkErrors)

router.put(
  '/images/:id',
  upload.single('image'),
  (req, res) => {
    res.sendStatus(201)
  }
)

router.all('/images/:id', (req, res, next) => {
  if (!fs.existsSync(`./cards/${req.params.id}.png`)) {
    res.sendStatus(404)
    return
  }
  next()
})

router.get(
  '/images/:id',
  (req, res) => {
    const file = fs.readFileSync(`./cards/${req.params.id}.png`)
    res.contentType('png').status(200).send(file)
  }
)

// router.delete('/images/:id', (req, res) => {
//   fs.unlinkSync(`./cards/${req.params.id}.png`)
//   res.sendStatus(204)
// })

export default router
