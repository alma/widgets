import { ApiMode, Widgets } from '@alma/widgets'

const widgets = Widgets.initialize('merchant_consumer_check', ApiMode.TEST)

widgets.add(Widgets.PaymentPlans, {
  container: '#alma-widget',
  purchaseAmount: 45000,
})
