/**
 * Internationalization (i18n) messages
 * These strings will be integrated with Crowdin for translation management
 */

export const messages = {
  en: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Loading...',
    'paymentPlans.error': 'Error loading payment plans',
    'paymentPlans.noPlans': 'No payment plans available',
    'paymentPlans.payIn': 'Pay in',
    'paymentPlans.payNow': 'Pay now',
    'paymentPlans.installments': '{count, plural, one {installment} other {installments}}',
    'paymentPlans.perMonth': '/ month',
    'paymentPlans.regionLabel': 'Alma payment options',
    'paymentPlans.logoButton': 'Open Alma payment details',
    'paymentPlans.planOptions': 'Available payment plans',
    'paymentPlans.acceptedCards': 'Accepted payment cards',
    'paymentPlans.noFee': '(no fees)',
    'paymentPlans.creditMoreInfo': 'Click to learn more',
    'paymentPlans.deferredPayOn': '{totalAmount} to be paid on {dueDate}',
    'paymentPlans.payNowWithAmount': 'Pay now {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} then {remainingCount} x {otherAmount}',

    // Ineligible plan constraints (visible but disabled plans)
    'paymentPlans.ineligible': 'This payment option is not available for this amount.',
    'paymentPlans.ineligibleMin': 'From {minAmount}',
    'paymentPlans.ineligibleMax': 'Up to {maxAmount}',
    'paymentPlans.ineligibleBetween': 'From {minAmount} to {maxAmount}',

    // Modal
    'modal.titleNormal': 'Pay in installments by credit card with Alma.',
    'modal.titleDeferred': 'Pay in installments or later by credit card with Alma.',
    'modal.titlePayNow': 'Pay in full by credit card with Alma.',
    'modal.close': 'Close',
    'modal.loading': 'Loading...',
    'modal.noPlans': 'No payment plans available',
    'modal.today': 'Today',
    'modal.total': 'Total',
    'modal.fees': 'Including fees (incl. VAT)',
    'modal.creditCost': 'Including credit cost',
    'modal.creditWarningTitle': 'A loan commits you and must be repaid.',
    'modal.creditWarning': 'Check your repayment capacity before committing.',
    'modal.scheduleTitle': 'Payment schedule',
    'modal.planOptions': 'Payment plan options',
    'modal.skipToPlans': 'Go to payment options',
    'modal.skipToInfo': 'Go to payment information',
    'modal.skipToSchedule': 'Go to payment schedule',
    'accessibility.skipLinksNavLabel': 'Quick navigation',
    'modal.acceptedCards': 'Accepted cards',
    'modal.dialogLabel': 'Payment plan details',
    'modal.infoTitle': 'How to proceed with payment',
    'modal.infoBullet1': 'Choose <strong>Alma</strong> at checkout.',
    'modal.infoBullet1P1X': 'Choose <strong>Alma - Pay now</strong> at checkout.',

    // Accessibility announcements
    'accessibility.planChanged': 'Plan selected: {plan}',
    'modal.infoBullet2':
      'Let yourself be guided and validate your payment in <strong>2 minutes.</strong>',
    'modal.infoBullet2P1X': 'Enter your <strong>credit card information.</strong>',
    'modal.infoBullet3':
      '<strong>Stay in control</strong> by moving your installments forward or backward at your own pace.',
    'modal.infoBullet3P1X': '<strong>Payment validation</strong> is instant!',
    'modal.creditLegalText':
      'Loan of {totalWithoutFirstInstallment} at a fixed interest rate of {taegPercentage} over a period of {installmeentsCountWithoutFirst} months. In addition to a down payment of {firstInstallmentAmount}, this loan can be used to finance a purchase of {productPriceWithoutCreditCost}. Subject to review and acceptance by Alma. Legal cooling-off period of 14 days. Simulation presented by Alma, registered with the RCS Nanterre under number 839 100 575, payment and finance company approved by the ACPR under number 17408 (CIB number / Bank code).',
  },

  fr: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Chargement...',
    'paymentPlans.error': 'Erreur lors du chargement des plans de paiement',
    'paymentPlans.noPlans': 'Aucun plan de paiement disponible',
    'paymentPlans.payIn': 'Payer en',
    'paymentPlans.payNow': 'Payer maintenant',
    'paymentPlans.installments': '{count, plural, one {fois} other {fois}}',
    'paymentPlans.perMonth': '/ mois',
    'paymentPlans.regionLabel': 'Options de paiement Alma',
    'paymentPlans.logoButton': 'Ouvrir les détails de paiement Alma',
    'paymentPlans.planOptions': 'Plans de paiement disponibles',
    'paymentPlans.acceptedCards': 'Cartes de paiement acceptées',
    'paymentPlans.noFee': '(sans frais)',
    'paymentPlans.creditMoreInfo': 'Cliquez pour en savoir plus',
    'paymentPlans.deferredPayOn': '{totalAmount} à payer le {dueDate}',
    'paymentPlans.payNowWithAmount': 'Payer maintenant {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} puis {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': "Cette option de paiement n'est pas disponible pour ce montant.",
    'paymentPlans.ineligibleMin': 'À partir de {minAmount}',
    'paymentPlans.ineligibleMax': "Jusqu'à {maxAmount}",
    'paymentPlans.ineligibleBetween': 'À partir de {minAmount} à {maxAmount}',

    // Modal
    'modal.titleNormal': 'Payez en plusieurs fois par carte bancaire avec Alma.',
    'modal.titleDeferred': 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
    'modal.titlePayNow': 'Payez comptant par carte bancaire avec Alma.',
    'modal.close': 'Fermer',
    'modal.loading': 'Chargement...',
    'modal.noPlans': 'Aucun plan de paiement disponible',
    'modal.today': "Aujourd'hui",
    'modal.total': 'Total',
    'modal.fees': 'Dont frais (TTC)',
    'modal.creditCost': 'Dont coût du crédit',
    'modal.creditWarningTitle': 'Un crédit vous engage et doit être remboursé.',
    'modal.creditWarning': 'Vérifiez vos capacités de remboursement avant de vous engager.',
    'modal.scheduleTitle': 'Calendrier de paiement',
    'modal.planOptions': 'Options de paiement',
    'modal.skipToPlans': 'Aller aux options de paiement',
    'modal.skipToInfo': 'Aller aux informations de paiement',
    'modal.skipToSchedule': 'Aller au calendrier de paiement',
    'accessibility.skipLinksNavLabel': 'Navigation rapide',
    'modal.acceptedCards': 'Cartes acceptées',
    'modal.dialogLabel': 'Détails du plan de paiement',
    'modal.infoTitle': 'Comment procéder au paiement',
    'modal.infoBullet1': 'Choisissez <strong>Alma</strong> au moment du paiement.',
    'modal.infoBullet1P1X':
      'Choisissez <strong>Alma - Payer maintenant</strong> au moment du paiement.',
    'modal.infoBullet2':
      'Laissez-vous guider et validez votre paiement en <strong>2 minutes.</strong>',
    'modal.infoBullet2P1X': 'Renseignez les informations de votre <strong>carte bancaire.</strong>',
    'modal.infoBullet3':
      '<strong>Gardez le contrôle</strong> en avançant ou reculant vos échéances à votre rythme.',
    'modal.infoBullet3P1X': '<strong>La validation</strong> de votre paiement est instantanée !',
    'modal.creditLegalText':
      "Crédit d'un montant de {totalWithoutFirstInstallment} au taux débiteur fixe de {taegPercentage} sur une durée de {installmeentsCountWithoutFirst} mois. Permettant, en complément d'un acompte de {firstInstallmentAmount}, de financer un achat d'un montant de {productPriceWithoutCreditCost}. Sous réserve d'étude et d'acceptation par Alma. Délai légal de rétractation de 14 jours. Simulation présentée par Alma, immatriculée au RCS Nanterre sous le numéro 839 100 575, établissement de paiement et société de financement agréée par l'ACPR sous le n° 17408 (numéro CIB / Code banque).",

    // Accessibility announcements
    'accessibility.planChanged': 'Plan sélectionné : {plan}',
  },

  de: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Laden...',
    'paymentPlans.error': 'Fehler beim Laden der Zahlungspläne',
    'paymentPlans.noPlans': 'Keine Zahlungspläne verfügbar',
    'paymentPlans.payIn': 'Zahlen Sie in',
    'paymentPlans.payNow': 'Jetzt bezahlen',
    'paymentPlans.installments': '{count, plural, one {Rate} other {Raten}}',
    'paymentPlans.perMonth': '/ Monat',
    'paymentPlans.regionLabel': 'Alma Zahlungsoptionen',
    'paymentPlans.logoButton': 'Alma Zahlungsdetails öffnen',
    'paymentPlans.planOptions': 'Verfügbare Zahlungspläne',
    'paymentPlans.acceptedCards': 'Akzeptierte Zahlungskarten',
    'paymentPlans.noFee': '(keine Gebühren)',
    'paymentPlans.creditMoreInfo': 'Klicken Sie, um mehr zu erfahren',
    'paymentPlans.deferredPayOn': '{totalAmount} ist zu zahlen am {dueDate}',
    'paymentPlans.payNowWithAmount': 'Jetzt bezahlen {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} dann {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': 'Diese Zahlungsoption ist für diesen Betrag nicht verfügbar.',
    'paymentPlans.ineligibleMin': 'Ab {minAmount}',
    'paymentPlans.ineligibleMax': 'Bis {maxAmount}',
    'paymentPlans.ineligibleBetween': 'Von {minAmount} bis {maxAmount}',

    // Modal
    'modal.titleNormal': 'Zahlen Sie in Raten per Kreditkarte mit Alma.',
    'modal.titleDeferred': 'Zahlen Sie in Raten oder später per Kreditkarte mit Alma.',
    'modal.titlePayNow': 'Zahlen Sie vollständig per Kreditkarte mit Alma.',
    'modal.close': 'Schließen',
    'modal.loading': 'Laden...',
    'modal.noPlans': 'Keine Zahlungspläne verfügbar',
    'modal.today': 'Heute',
    'modal.total': 'Gesamt',
    'modal.fees': 'Davon Gebühren',
    'modal.creditCost': 'Davon Kreditkosten',
    'modal.creditWarningTitle': 'Ein Kredit verpflichtet Sie und muss zurückgezahlt werden.',
    'modal.creditWarning': 'Prüfen Sie Ihre Rückzahlungsfähigkeit, bevor Sie sich verpflichten.',
    'modal.scheduleTitle': 'Zahlungsplan',
    'modal.planOptions': 'Zahlungsplanoptionen',
    'modal.skipToPlans': 'Zu Zahlungsoptionen',
    'modal.skipToInfo': 'Zu Zahlungsinformationen',
    'modal.skipToSchedule': 'Zum Zahlungsplan',
    'accessibility.skipLinksNavLabel': 'Schnelle Navigation',
    'modal.acceptedCards': 'Akzeptierte Karten',
    'modal.dialogLabel': 'Zahlungsplan Details',
    'modal.infoTitle': 'Wie man mit der Zahlung fortfährt',
    'modal.infoBullet1': 'Wählen Sie <strong>Alma</strong> an der Kasse.',
    'modal.infoBullet1P1X': 'Wählen Sie <strong>Alma - Jetzt bezahlen</strong> an der Kasse.',
    'modal.infoBullet2': 'Wählen Sie die gewünschte Anzahl an Raten.',
    'modal.infoBullet2P1X': 'Geben Sie Ihre Kreditkarteninformationen ein.',
    'modal.infoBullet3': 'Geben Sie Ihre Kreditkarteninformationen ein.',
    'modal.infoBullet3P1X': 'Schließen Sie Ihre Bestellung vertrauensvoll ab!',
    'modal.creditLegalText':
      'Kredit in Höhe von {totalWithoutFirstInstallment} zu einem festen Sollzinssatz von {taegPercentage} über eine Laufzeit von {installmeentsCountWithoutFirst} Monaten. Ermöglicht, zusätzlich zu einer Anzahlung von {firstInstallmentAmount}, die Finanzierung eines Kaufs in Höhe von {productPriceWithoutCreditCost}. Vorbehaltlich der Prüfung und Annahme durch Alma. Gesetzliche Widerrufsfrist von 14 Tagen. Simulation präsentiert von Alma, eingetragen im RCS Nanterre unter der Nummer 839 100 575, Zahlungsinstitut und Finanzierungsgesellschaft, zugelassen von der ACPR unter der Nummer 17408 (IPC-Nummer / Bankcode).',

    // Accessibility announcements
    'accessibility.planChanged': 'Plan ausgewählt: {plan}',
  },

  es: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Cargando...',
    'paymentPlans.error': 'Error al cargar los planes de pago',
    'paymentPlans.noPlans': 'No hay planes de pago disponibles',
    'paymentPlans.payIn': 'Pagar en',
    'paymentPlans.payNow': 'Pagar ahora',
    'paymentPlans.installments': '{count, plural, one {plazo} other {plazos}}',
    'paymentPlans.perMonth': '/ mes',
    'paymentPlans.regionLabel': 'Opciones de pago Alma',
    'paymentPlans.logoButton': 'Abrir detalles de pago Alma',
    'paymentPlans.planOptions': 'Planes de pago disponibles',
    'paymentPlans.acceptedCards': 'Tarjetas de pago aceptadas',
    'paymentPlans.noFee': '(sin comisiones)',
    'paymentPlans.creditMoreInfo': 'Haga clic para saber más',
    'paymentPlans.deferredPayOn': '{totalAmount} a pagar el {dueDate}',
    'paymentPlans.payNowWithAmount': 'Pagar ahora {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} luego {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': 'Esta opción de pago no está disponible para este importe.',
    'paymentPlans.ineligibleMin': 'Desde {minAmount}',
    'paymentPlans.ineligibleMax': 'Hasta {maxAmount}',
    'paymentPlans.ineligibleBetween': 'De {minAmount} a {maxAmount}',

    // Modal
    'modal.titleNormal': 'Pague a plazos com tarjeta bancaria com Alma.',
    'modal.titleDeferred': 'Pague a plazos o mais tarde com tarjeta bancaria com Alma.',
    'modal.titlePayNow': 'Pague à vista com tarjeta bancaria com Alma.',
    'modal.close': 'Cerrar',
    'modal.loading': 'Cargando...',
    'modal.noPlans': 'No hay planes de pago disponibles',
    'modal.today': 'Hoy',
    'modal.total': 'Total',
    'modal.fees': 'Incluye comisiones (IVA incl.)',
    'modal.creditCost': 'Incluye coste del crédito',
    'modal.creditWarningTitle': 'Un crédito le compromete y debe ser reembolsado.',
    'modal.creditWarning': 'Verifique su capacidad de reembolso antes de comprometerse.',
    'modal.scheduleTitle': 'Calendario de pago',
    'modal.planOptions': 'Opciones de pago',
    'modal.skipToPlans': 'Ir a opciones de pago',
    'modal.skipToInfo': 'Ir a información de pago',
    'modal.skipToSchedule': 'Ir al calendario de pago',
    'accessibility.skipLinksNavLabel': 'Navegación rápida',
    'modal.acceptedCards': 'Tarjetas aceptadas',
    'modal.dialogLabel': 'Detalles del plan de pago',
    'modal.infoTitle': 'Cómo proceder con el pago',
    'modal.infoBullet1': 'Elija <strong>Alma</strong> al pagar.',
    'modal.infoBullet1P1X': 'Elija <strong>Alma - Pagar ahora</strong> al pagar.',
    'modal.infoBullet2': 'Déjese guiar y valide su pago en <strong>2 minutos.</strong>',
    'modal.infoBullet2P1X': 'Ingrese su <strong>información de tarjeta de crédito.</strong>',
    'modal.infoBullet3':
      '<strong>¡Manténgase en control!</strong> moviendo sus plazos hacia adelante o hacia atrás a su propio ritmo.',
    'modal.infoBullet3P1X': '<strong>¡La validación del pago</strong> es instantánea!',
    'modal.creditLegalText':
      'Préstamo de {totalWithoutFirstInstallment} a un tipo deudor fijo a {taegPercentage} a lo largo de un periodo de {installmeentsCountWithoutFirst} meses. Además de un depósito de {firstInstallmentAmount}, esto te permitirá financiar una compra de {productPriceWithoutCreditCost}. Sujeto a revisión y aceptación por parte de Alma. Plazo legal de retractación de 14 días. Simulación presentada por Alma, inscrita en el Registro Mercantil de Nanterre con el número 839 100 575, sociedad de pago y financiación autorizada por la ACPR con el número 17408 (número CIB / código bancario).',

    // Accessibility announcements
    'accessibility.planChanged': 'Plan seleccionado: {plan}',
  },

  it: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Caricamento...',
    'paymentPlans.error': 'Errore nel caricamento dei piani di pagamento',
    'paymentPlans.noPlans': 'Nessun piano di pagamento disponibile',
    'paymentPlans.payIn': 'Paga in',
    'paymentPlans.payNow': 'Paga ora',
    'paymentPlans.installments': '{count, plural, one {rata} other {rate}}',
    'paymentPlans.perMonth': '/ mese',
    'paymentPlans.regionLabel': 'Opzioni di pagamento Alma',
    'paymentPlans.logoButton': 'Apri dettagli di pagamento Alma',
    'paymentPlans.planOptions': 'Piani di pagamento disponibili',
    'paymentPlans.acceptedCards': 'Carte di pagamento accettate',
    'paymentPlans.noFee': '(senza commissioni)',
    'paymentPlans.creditMoreInfo': 'Fai clic per saperne di più',
    'paymentPlans.deferredPayOn': '{totalAmount} da pagare il {dueDate}',
    'paymentPlans.payNowWithAmount': 'Paga ora {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} poi {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': 'Questa opzione di pagamento non è disponibile per questo importo.',
    'paymentPlans.ineligibleMin': 'Da {minAmount}',
    'paymentPlans.ineligibleMax': 'Fino a {maxAmount}',
    'paymentPlans.ineligibleBetween': 'Da {minAmount} a {maxAmount}',

    // Modal
    'modal.titleNormal': 'Paga a rate con carta di credito con Alma.',
    'modal.titleDeferred': 'Paga a rate o più tardi con carta di credito con Alma.',
    'modal.titlePayNow': 'Paga in contanti con carta di credito con Alma.',
    'modal.close': 'Chiudi',
    'modal.loading': 'Caricamento...',
    'modal.noPlans': 'Nessun piano di pagamento disponibile',
    'modal.today': 'Oggi',
    'modal.total': 'Totale',
    'modal.fees': 'Di cui commissioni',
    'modal.creditCost': 'Di cui costo del credito',
    'modal.creditWarningTitle': 'Un credito ti impegna e deve essere rimborsato.',
    'modal.creditWarning': 'Verifica la tua capacità di rimborso prima di impegnarti.',
    'modal.scheduleTitle': 'Calendario di pagamento',
    'modal.planOptions': 'Opzioni di pagamento',
    'modal.skipToPlans': 'Vai alle opzioni di pagamento',
    'modal.skipToInfo': 'Vai alle informazioni di pagamento',
    'modal.skipToSchedule': 'Vai al calendario di pagamento',
    'accessibility.skipLinksNavLabel': 'Navigazione veloce',
    'modal.acceptedCards': 'Carte accettate',
    'modal.dialogLabel': 'Dettagli del piano di pagamento',
    'modal.infoTitle': 'Come procedere con il pagamento',
    'modal.infoBullet1': 'Scegli <strong>Alma</strong> al checkout.',
    'modal.infoBullet1P1X': 'Scegli <strong>Alma - Paga ora</strong> al checkout.',
    'modal.infoBullet2': 'Lasciati guidare e convalida il pagamento in <strong>2 minuti.</strong>',
    'modal.infoBullet2P1X':
      'Inserisci le <strong>informazioni della tua carta di credito.</strong>',
    'modal.infoBullet3':
      '<strong>Rimani in controllo</strong> spostando le tue rate avanti o indietro al tuo ritmo.',
    'modal.infoBullet3P1X': '<strong>La validazione del pagamento</strong> è istantanea!',
    'modal.creditLegalText':
      "Prestito di {totalWithoutFirstInstallment} a tasso fisso di {taegPercentage} per un periodo di {installmeentsCountWithoutFirst} mesi. Oltre a un deposito di {firstInstallmentAmount}, questo vi permetterà di finanziare un acquisto di {productPriceWithoutCreditCost}. Soggetto a revisione e accettazione da parte di Alma. Periodo di recesso legale di 14 giorni. Simulazione presentata da Alma, iscritta al Registro del Commercio e delle Imprese di Nanterre con il numero 839 100 575, società di pagamento e di finanziamento approvata dall'ACPR con il numero 17408 (numero CIB / codice bancario).",

    // Accessibility announcements
    'accessibility.planChanged': 'Piano selezionato: {plan}',
  },

  pt: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Carregando...',
    'paymentPlans.error': 'Erro ao carregar planos de pagamento',
    'paymentPlans.noPlans': 'Nenhum plano de pagamento disponível',
    'paymentPlans.payIn': 'Pagar em',
    'paymentPlans.payNow': 'Pagar agora',
    'paymentPlans.installments': '{count, plural, one {parcela} other {parcelas}}',
    'paymentPlans.perMonth': '/ mês',
    'paymentPlans.regionLabel': 'Opções de pagamento Alma',
    'paymentPlans.logoButton': 'Abrir detalhes de pagamento Alma',
    'paymentPlans.planOptions': 'Planos de pagamento disponíveis',
    'paymentPlans.acceptedCards': 'Cartões de pagamento aceitos',
    'paymentPlans.noFee': '(sem taxas)',
    'paymentPlans.creditMoreInfo': 'Clique para saber mais',
    'paymentPlans.deferredPayOn': '{totalAmount} a pagar em {dueDate}',
    'paymentPlans.payNowWithAmount': 'Pagar agora {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} depois {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': 'Esta opção de pagamento não está disponível para este montante.',
    'paymentPlans.ineligibleMin': 'A partir de {minAmount}',
    'paymentPlans.ineligibleMax': 'Até {maxAmount}',
    'paymentPlans.ineligibleBetween': 'De {minAmount} a {maxAmount}',

    // Modal
    'modal.titleNormal': 'Pague em prestações com cartão de crédito com Alma.',
    'modal.titleDeferred': 'Pague em prestações ou mais tarde com cartão de crédito com Alma.',
    'modal.titlePayNow': 'Pague à vista com cartão de crédito com Alma.',
    'modal.close': 'Fechar',
    'modal.loading': 'Carregando...',
    'modal.noPlans': 'Nenhum plano de pagamento disponível',
    'modal.today': 'Hoje',
    'modal.total': 'Total',
    'modal.fees': 'Incluindo taxas (IVA incl.)',
    'modal.creditCost': 'Incluindo custo do crédito',
    'modal.creditWarningTitle': 'Um crédito compromete você e deve ser reembolsado.',
    'modal.creditWarning': 'Verifique sua capacidade de reembolso antes de se comprometer.',
    'modal.scheduleTitle': 'Calendário de pagamento',
    'modal.planOptions': 'Opções de pagamento',
    'modal.skipToPlans': 'Ir para opções de pagamento',
    'modal.skipToInfo': 'Ir para informações de pagamento',
    'modal.skipToSchedule': 'Ir para calendário de pagamento',
    'accessibility.skipLinksNavLabel': 'Navegação rápida',
    'modal.acceptedCards': 'Cartões aceitos',
    'modal.dialogLabel': 'Detalhes do plano de pagamento',
    'modal.infoTitle': 'Como proceder com o pagamento',
    'modal.infoBullet1': 'Escolha <strong>Alma</strong> no checkout.',
    'modal.infoBullet1P1X': 'Escolha <strong>Alma - Pagar agora</strong> no checkout.',
    'modal.infoBullet2': 'Deixe-se guiar e valide seu pagamento em <strong>2 minutos.</strong>',
    'modal.infoBullet2P1X': 'Insira suas <strong>informações do cartão de crédito.</strong>',
    'modal.infoBullet3':
      '<strong>Mantenha o controle</strong> movendo suas prestações para frente ou para trás no seu próprio ritmo.',
    'modal.infoBullet3P1X': '<strong>A validação do pagamento</strong> é instantânea!',
    'modal.creditLegalText':
      'Empréstimo de {totalWithoutFirstInstallment} a uma taxa de juro fixa de {taegPercentage} durante um período de {installmeentsCountWithoutFirst} meses. Para além de um depósito de {firstInstallmentAmount}, isto permitir-lhe-á financiar uma compra de {productPriceWithoutCreditCost}. Sujeito a análise e aceitação pela Alma. Prazo legal de retratação de 14 dias. Simulação apresentada pela Alma, inscrita na Conservatória do Registo Comercial e das Sociedades de Nanterre sob o número 839 100 575, sociedade de pagamento e de financiamento aprovada pela ACPR sob o número 17408 (número CIB / código bancário).',

    // Accessibility announcements
    'accessibility.planChanged': 'Plano selecionado: {plan}',
  },

  nl: {
    // Payment Plans Widget
    'paymentPlans.loading': 'Laden...',
    'paymentPlans.error': 'Fout bij het laden van betalingsplannen',
    'paymentPlans.noPlans': 'Geen betalingsplannen beschikbaar',
    'paymentPlans.payIn': 'Betaal in',
    'paymentPlans.payNow': 'Nu betalen',
    'paymentPlans.installments': '{count, plural, one {termijn} other {termijnen}}',
    'paymentPlans.perMonth': '/ maand',
    'paymentPlans.regionLabel': 'Alma betalingsopties',
    'paymentPlans.logoButton': 'Open Alma betalingsdetails',
    'paymentPlans.planOptions': 'Beschikbare betalingsplannen',
    'paymentPlans.acceptedCards': 'Geaccepteerde betaalkaarten',
    'paymentPlans.noFee': '(geen kosten)',
    'paymentPlans.creditMoreInfo': 'Klik om meer te leren',
    'paymentPlans.deferredPayOn': '{totalAmount} te betalen op {dueDate}',
    'paymentPlans.payNowWithAmount': 'Nu betalen {totalAmount}',
    'paymentPlans.multipleInstallmentsSame': '{count} x {amount}',
    'paymentPlans.multipleInstallmentsDifferent':
      '{firstAmount} dan {remainingCount} x {otherAmount}',

    // Ineligible plan constraints
    'paymentPlans.ineligible': 'Deze betaaloptie is niet beschikbaar voor dit bedrag.',
    'paymentPlans.ineligibleMin': 'Vanaf {minAmount}',
    'paymentPlans.ineligibleMax': 'Tot {maxAmount}',
    'paymentPlans.ineligibleBetween': 'Van {minAmount} tot {maxAmount}',

    // Modal
    'modal.titleNormal': 'Betaal in termijnen met creditcard met Alma.',
    'modal.titleDeferred': 'Betaal in termijnen of later met creditcard met Alma.',
    'modal.titlePayNow': 'Betaal contant met creditcard met Alma.',
    'modal.close': 'Sluiten',
    'modal.loading': 'Laden...',
    'modal.noPlans': 'Geen betalingsplannen beschikbaar',
    'modal.today': 'Vandaag',
    'modal.total': 'Totaal',
    'modal.fees': 'Inclusief kosten (incl. BTW)',
    'modal.creditCost': 'Inclusief kredietkosten',
    'modal.creditWarningTitle': 'Een krediet verbindt u en moet worden terugbetaald.',
    'modal.creditWarning': 'Controleer uw terugbetalingscapaciteit voordat u zich verbindt.',
    'modal.scheduleTitle': 'Betalingsschema',
    'modal.planOptions': 'Betalingsplanopties',
    'modal.skipToPlans': 'Ga naar betalingsopties',
    'modal.skipToInfo': 'Ga naar betalingsinformatie',
    'modal.skipToSchedule': 'Ga naar betalingsschema',
    'accessibility.skipLinksNavLabel': 'Snelle navigatie',
    'modal.acceptedCards': 'Geaccepteerde kaarten',
    'modal.dialogLabel': 'Betalingsplan details',
    'modal.infoTitle': 'Hoe te betalen',
    'modal.infoBullet1': 'Kies <strong>Alma</strong> bij het afrekenen.',
    'modal.infoBullet1P1X': 'Kies <strong>Alma - Nu betalen</strong> bij het afrekenen.',
    'modal.infoBullet2': 'Laat u begeleiden en valideer uw betaling in <strong>2 minuten.</strong>',
    'modal.infoBullet2P1X': 'Voer uw <strong>creditcardgegevens in.</strong>',
    'modal.infoBullet3':
      '<strong>Blijf in controle</strong> door uw termijnen vooruit of achteruit te verplaatsen in uw eigen tempo.',
    'modal.infoBullet3P1X': '<strong>Betalingsvalidatie</strong> is instant!',
    'modal.creditLegalText':
      'Krediet van {totalWithoutFirstInstallment} tegen een vaste rentevoet van {taegPercentage} over een periode van {installmeentsCountWithoutFirst} maanden. Naast een aanbetaling van {firstInstallmentAmount}, kun je hiermee een aankoop financieren van {productPriceWithoutCreditCost}. Onder voorbehoud van beoordeling en aanvaarding door Alma. Wettelijke herroepingsrecht van 14 dagen. Simulatie aangeboden door Alma, ingeschreven in het handels- en bedrijvenregister van Nanterre onder het nummer 839 100 575, betalings- en financieringsmaatschappij erkend door de ACPR onder nummer 17408 (CIB-nummer / bankcode).',

    // Accessibility announcements
    'accessibility.planChanged': 'Plan geselecteerd: {plan}',
  },
} as const

export type Locale = keyof typeof messages
export type MessageKey = keyof typeof messages.en

/**
 * Get a translated message
 * @param locale - The locale to use
 * @param key - The message key
 * @param params - Optional parameters for interpolation
 */
export function t(locale: Locale, key: MessageKey, params?: Record<string, any>): string {
  const localeMessages = messages[locale] || messages.fr
  let message: string = localeMessages[key] || messages.fr[key] || key

  // Simple parameter interpolation
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      message = message.replace(new RegExp(`{${param}}`, 'g'), String(value))
    })

    // Handle plurals (simple version)
    const pluralMatch = message.match(/{(\w+),\s*plural,\s*one\s*{([^}]+)}\s*other\s*{([^}]+)}}/)
    if (pluralMatch && params[pluralMatch[1]]) {
      const count = params[pluralMatch[1]]
      const result = count === 1 ? pluralMatch[2] : pluralMatch[3]
      message = result as string
    }
  }

  return message
}
