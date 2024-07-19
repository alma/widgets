import { rest } from 'msw'
import { ApiMode } from 'consts'
import { mockButtonPlans } from 'test/fixtures'

export const handlers = [
  rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockButtonPlans))
  }),
]
