import { mockButtonPlans } from 'test/fixtures'
import Basics from './tests/Basic'
import Credit from './tests/Credit'
import CustomTransitionDelay from './tests/CustomTransitionDelay'
import HideWidget from './tests/HideWidget'
import IneligibleOptions from './tests/IneligibleOptions'
import LanguageCheck from './tests/LanguageCheck'
import LaunchModal from './tests/LaunchModal'
import SuggestedPaymentPlan from './tests/SuggestedPaymentPlan'
import WithoutPlans from './tests/WithoutPlans'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})
jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01').getTime())

const animationDuration = 5600 // 5500 + Time for transition

describe('Button', () => {
  describe('Basics', Basics.bind(this))
  describe('Change language', LanguageCheck.bind(this))
  describe('No plans provided', WithoutPlans.bind(this, animationDuration))
  describe('PaymentPlan', () => {
    describe('has credit', Credit.bind(this, animationDuration))
    describe('has ineligible options', IneligibleOptions.bind(this, animationDuration))
    describe('has suggestedPaymentPlan', SuggestedPaymentPlan.bind(this, animationDuration))
  })
  describe('Custom transition delay', CustomTransitionDelay.bind(this, 500))
  describe('Hide if not applicable', HideWidget.bind(this))
  describe('Modal initializes with the correct plan', LaunchModal.bind(this))
})
