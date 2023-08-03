import {
  type NextFunction,
  type Request,
  type Response,
  Router
} from 'express'
import fs from 'node:fs'
import { param, validationResult } from 'express-validator'
import multer from 'multer'
import db from '../db'

function checkErrors (req: Request, res: Response, next: NextFunction) {
  const result = validationResult(req)
  if (result.isEmpty()) {
    next()
    return
  }
  res.send({ errors: result.array() })
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
    const result = await db.selectFrom('card').selectAll().execute()
    res.send(result)
  })()
})

router.put(
  '/:id',
  param('id').isNumeric().exists(),
  checkErrors,
  (req, res) => {
    res.sendStatus(201)
  }
)

router.put(
  '/images/:id',
  param('id').isNumeric().exists(),
  checkErrors,
  upload.single('image'),
  (req, res) => {
    res.sendStatus(201)
  }
)

router.get(
  '/images/:id',
  param('id').isNumeric().exists(),
  checkErrors,
  (req, res) => {
    const path = `./cards/${req.params.id}.png`
    if (!fs.existsSync(path)) {
      res.sendStatus(404)
      return
    }
    const file = fs.readFileSync(path)
    res.contentType('png').status(200).send(file)
  }
)

export default router
