import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="mpg-calculator"
export default class extends Controller {
  static targets = [
    "form",
    "results",
    "calculateButton",
    "currentMpg",
    "currentGasPrice",
    "currentPayment",
    "currentInsurance",
    "currentMaintenance",
    "currentTradeIn",
    "newMpg",
    "newGasPrice",
    "newPayment",
    "newInsurance",
    "newMaintenance",
    "milesPerMonth",
    "newTotalCostEstimate",
    "currentFuelCost",
    "currentPaymentDisplay",
    "currentInsuranceDisplay",
    "currentMaintenanceDisplay",
    "currentTotal",
    "newFuelCost",
    "newPaymentDisplay",
    "newInsuranceDisplay",
    "newMaintenanceDisplay",
    "newTotal",
    "tradeInBreakdown",
    "newCarCostDisplay",
    "tradeInValueDisplay",
    "principalFinancedDisplay",
    "verdict",
    "verdictText",
    "verdictDetails"
  ]

  static values = {
    calculatorData: Object
  }

  connect() {
    console.log("MPG Calculator controller connected")

    // Constants
    this.globalRate = 7.5
    this.globalTerm = 60

    // State tracking
    this.resultsDisplayed = false
    this.lastCalculatedValues = null

    // Parse URL parameters for form prepopulation
    const urlParams = new URLSearchParams(window.location.search)
    const urlData = this.parseUrlParams(urlParams)

    // Priority: URL params > saved session data
    const dataToUse = (urlData && Object.keys(urlData).length > 0) ? urlData : this.calculatorDataValue

    // Pre-populate form with URL params or saved data
    if (dataToUse && Object.keys(dataToUse).length > 0) {
      this.populateFormFields(dataToUse)

      // Auto-calculate if all fields are populated
      if (this.formTarget.checkValidity()) {
        this.calculateCosts()
      }
    }

    // Update cost estimate on initial load
    this.updateTotalCostEstimate()
  }

  // Called when input changes
  handleInput() {
    this.checkFormState()
  }

  // Called when new payment input changes
  handleNewPaymentInput() {
    this.updateTotalCostEstimate()
    this.checkFormState()
  }

  // Form submission handler
  async submitForm(event) {
    event.preventDefault()
    this.calculateCosts()

    // Save form data to session after calculation
    const formData = new FormData(this.formTarget)
    const formObject = Object.fromEntries(formData)
    await this.saveCalculatorData(formObject)
  }

  /**
   * Calculate the total cost of the car based on the term (in months) and the monthly amount
   * considering the interest rate. The interest should be compounded monthly
   *
   * Uses present value formula: PV = PMT * ((1 - (1 + r)^-n) / r)
   *
   * @param {number} monthly_amount - Monthly payment amount in dollars
   * @param {number} term - Loan term in months (default: 60)
   * @param {number} rate - Annual interest rate as percentage (default: 7.5)
   * @returns {number} Estimated principal/car cost in dollars
   */
  estimateCarCost(monthly_amount, term = this.globalTerm, rate = this.globalRate) {
    // Convert annual percentage rate to monthly decimal rate
    const monthlyRate = rate / 12 / 100

    // Handle edge case of 0% interest
    if (monthlyRate === 0) {
      return monthly_amount * term
    }

    // Calculate present value (principal amount)
    // PV = PMT * ((1 - (1 + r)^-n) / r)
    const presentValue = monthly_amount * ((1 - Math.pow(1 + monthlyRate, -term)) / monthlyRate)

    return presentValue
  }

  /**
   * Calculate the monthly payment based on the principal (car cost)
   * considering the interest rate and loan term.
   *
   * Uses payment formula: PMT = PV * (r / (1 - (1 + r)^-n))
   *
   * @param {number} principal - Principal/car cost in dollars
   * @param {number} term - Loan term in months (default: 60)
   * @param {number} rate - Annual interest rate as percentage (default: 7.5)
   * @returns {number} Monthly payment amount in dollars
   */
  calculateMonthlyPayment(principal, term = this.globalTerm, rate = this.globalRate) {
    // Convert annual percentage rate to monthly decimal rate
    const monthlyRate = rate / 12 / 100

    // Handle edge case of 0% interest
    if (monthlyRate === 0) {
      return principal / term
    }

    // Calculate monthly payment
    // PMT = PV * (r / (1 - (1 + r)^-n))
    const monthlyPayment = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -term)))

    return monthlyPayment
  }

  // Parse URL parameters into calculator data structure
  parseUrlParams(urlParams) {
    const paramMap = {
      // Current car parameters
      'c_mpg': 'current_car.mpg',
      'c_gp': 'current_car.gas_price',
      'c_pay': 'current_car.payment',
      'c_ins': 'current_car.insurance',
      'c_mnt': 'current_car.maintenance',
      'c_trade': 'current_car.trade_in',
      // New car parameters
      'n_mpg': 'new_car.mpg',
      'n_gp': 'new_car.gas_price',
      'n_pay': 'new_car.payment',
      'n_ins': 'new_car.insurance',
      'n_mnt': 'new_car.maintenance',
      // Driving habits
      'miles': 'driving_habits.miles_per_month'
    }

    const data = {
      current_car: {},
      new_car: {},
      driving_habits: {}
    }

    let hasData = false

    for (const [param, path] of Object.entries(paramMap)) {
      const value = urlParams.get(param)
      if (value !== null && value !== '') {
        const [section, field] = path.split('.')
        data[section][field] = parseFloat(value)
        hasData = true
      }
    }

    return hasData ? data : null
  }

  // Generate shareable URL with current form values
  generateShareableUrl() {
    const params = new URLSearchParams()

    // Current car values
    const currentMpg = this.currentMpgTarget.value
    const currentGasPrice = this.currentGasPriceTarget.value
    const currentPayment = this.currentPaymentTarget.value
    const currentInsurance = this.currentInsuranceTarget.value
    const currentMaintenance = this.currentMaintenanceTarget.value
    const currentTradeIn = this.currentTradeInTarget.value

    // New car values
    const newMpg = this.newMpgTarget.value
    const newGasPrice = this.newGasPriceTarget.value
    const newPayment = this.newPaymentTarget.value
    const newInsurance = this.newInsuranceTarget.value
    const newMaintenance = this.newMaintenanceTarget.value

    // Driving habits
    const milesPerMonth = this.milesPerMonthTarget.value

    // Add parameters if they have values
    if (currentMpg) params.set('c_mpg', currentMpg)
    if (currentGasPrice) params.set('c_gp', currentGasPrice)
    if (currentPayment) params.set('c_pay', currentPayment)
    if (currentInsurance) params.set('c_ins', currentInsurance)
    if (currentMaintenance) params.set('c_mnt', currentMaintenance)
    if (currentTradeIn) params.set('c_trade', currentTradeIn)

    if (newMpg) params.set('n_mpg', newMpg)
    if (newGasPrice) params.set('n_gp', newGasPrice)
    if (newPayment) params.set('n_pay', newPayment)
    if (newInsurance) params.set('n_ins', newInsurance)
    if (newMaintenance) params.set('n_mnt', newMaintenance)

    if (milesPerMonth) params.set('miles', milesPerMonth)

    // Generate full URL with parameters
    const baseUrl = window.location.origin + window.location.pathname
    return baseUrl + '?' + params.toString()
  }

  populateFormFields(data) {
    // Populate current car fields
    if (data.current_car) {
      this.currentMpgTarget.value = data.current_car.mpg ?? ''
      this.currentGasPriceTarget.value = data.current_car.gas_price ?? ''
      this.currentPaymentTarget.value = data.current_car.payment ?? ''
      this.currentInsuranceTarget.value = data.current_car.insurance ?? ''
      this.currentMaintenanceTarget.value = data.current_car.maintenance ?? ''
      this.currentTradeInTarget.value = data.current_car.trade_in ?? '0'
    }

    // Populate new car fields
    if (data.new_car) {
      this.newMpgTarget.value = data.new_car.mpg ?? ''
      this.newGasPriceTarget.value = data.new_car.gas_price ?? ''
      this.newPaymentTarget.value = data.new_car.payment ?? ''
      this.newInsuranceTarget.value = data.new_car.insurance ?? ''
      this.newMaintenanceTarget.value = data.new_car.maintenance ?? ''
    }

    // Populate driving habits fields
    if (data.driving_habits) {
      this.milesPerMonthTarget.value = data.driving_habits.miles_per_month ?? ''
    }
  }

  async saveCalculatorData(formData) {
    const metaPayload = {
      session: {
        meta: {
          mpg_calculator: {
            current_car: {
              mpg: parseFloat(formData.current_mpg),
              gas_price: parseFloat(formData.current_gas_price),
              payment: parseFloat(formData.current_payment),
              insurance: parseFloat(formData.current_insurance),
              maintenance: parseFloat(formData.current_maintenance),
              trade_in: parseFloat(formData.current_trade_in) || 0
            },
            new_car: {
              mpg: parseFloat(formData.new_mpg),
              gas_price: parseFloat(formData.new_gas_price),
              payment: parseFloat(formData.new_payment),
              insurance: parseFloat(formData.new_insurance),
              maintenance: parseFloat(formData.new_maintenance)
            },
            driving_habits: {
              miles_per_month: parseInt(formData.miles_per_month)
            },
            last_calculated_at: new Date().toISOString()
          }
        }
      }
    }

    try {
      // Get session ID from index endpoint
      const indexResponse = await fetch('/sessions', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!indexResponse.ok) {
        throw new Error(`Failed to get session ID: ${indexResponse.status}`)
      }

      const sessionData = await indexResponse.json()
      const sessionId = sessionData.id

      // Now update with calculator data using the actual session ID
      const response = await fetch(`/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log('Calculator data saved successfully')
    } catch (error) {
      console.error('Failed to save calculator data:', error)
    }
  }

  updateTotalCostEstimate() {
    const value = parseFloat(this.newPaymentTarget.value) || 0

    if (value <= 0) return

    const totalCost = Math.round(this.estimateCarCost(value))
    const totalCostFmt = `$${totalCost.toLocaleString('en-US')} estimated total (${this.globalTerm}mos @ %${this.globalRate})`

    this.newTotalCostEstimateTarget.innerText = totalCostFmt
  }

  checkFormState() {
    if (!this.resultsDisplayed || !this.lastCalculatedValues) {
      // No results displayed yet, keep button enabled
      this.enableButton()
      return
    }

    // Get current form values
    const currentValues = {
      current_mpg: parseFloat(this.currentMpgTarget.value) || 0,
      current_gas_price: parseFloat(this.currentGasPriceTarget.value) || 0,
      current_payment: parseFloat(this.currentPaymentTarget.value) || 0,
      current_insurance: parseFloat(this.currentInsuranceTarget.value) || 0,
      current_maintenance: parseFloat(this.currentMaintenanceTarget.value) || 0,
      current_trade_in: parseFloat(this.currentTradeInTarget.value) || 0,
      new_mpg: parseFloat(this.newMpgTarget.value) || 0,
      new_gas_price: parseFloat(this.newGasPriceTarget.value) || 0,
      new_payment: parseFloat(this.newPaymentTarget.value) || 0,
      new_insurance: parseFloat(this.newInsuranceTarget.value) || 0,
      new_maintenance: parseFloat(this.newMaintenanceTarget.value) || 0,
      miles_per_month: parseFloat(this.milesPerMonthTarget.value) || 0
    }

    // Compare current values with last calculated values
    const valuesMatch = Object.keys(currentValues).every(key => {
      return currentValues[key] === this.lastCalculatedValues[key]
    })

    // Disable button if values match (results are current), enable if they don't match
    if (valuesMatch) {
      this.disableButton()
    } else {
      this.enableButton()
    }
  }

  disableButton() {
    this.calculateButtonTarget.disabled = true
    this.calculateButtonTarget.classList.remove('bg-indigo-600', 'hover:bg-indigo-700', 'hover:scale-105')
    this.calculateButtonTarget.classList.add('bg-gray-500', 'cursor-not-allowed')
    this.calculateButtonTarget.style.backgroundColor = '#6b7280' // gray-500
    this.calculateButtonTarget.style.opacity = '0.8'
  }

  enableButton() {
    this.calculateButtonTarget.disabled = false
    this.calculateButtonTarget.classList.remove('bg-gray-500', 'cursor-not-allowed')
    this.calculateButtonTarget.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'hover:scale-105')
    this.calculateButtonTarget.style.backgroundColor = ''
    this.calculateButtonTarget.style.opacity = ''
  }

  calculateCosts() {
    // Get form values
    const currentMpg = parseFloat(this.currentMpgTarget.value)
    const currentGasPrice = parseFloat(this.currentGasPriceTarget.value)
    const currentPayment = parseFloat(this.currentPaymentTarget.value)
    const currentInsurance = parseFloat(this.currentInsuranceTarget.value)
    const currentMaintenanceAnnual = parseFloat(this.currentMaintenanceTarget.value)
    const currentTradeIn = parseFloat(this.currentTradeInTarget.value) || 0

    const newMpg = parseFloat(this.newMpgTarget.value)
    const newGasPrice = parseFloat(this.newGasPriceTarget.value)
    const newPayment = parseFloat(this.newPaymentTarget.value)
    const newInsurance = parseFloat(this.newInsuranceTarget.value)
    const newMaintenanceAnnual = parseFloat(this.newMaintenanceTarget.value)

    const milesPerMonth = parseFloat(this.milesPerMonthTarget.value)

    // Calculate adjusted new car payment based on trade-in
    // First estimate the new car's total cost from the payment
    const newCarCost = this.estimateCarCost(newPayment)
    // Subtract trade-in value from principal
    const adjustedPrincipal = newCarCost - currentTradeIn
    // Calculate new monthly payment based on reduced principal
    const adjustedNewPayment = adjustedPrincipal > 0 ? this.calculateMonthlyPayment(adjustedPrincipal) : 0

    // Store the calculated values for comparison
    this.lastCalculatedValues = {
      current_mpg: currentMpg,
      current_gas_price: currentGasPrice,
      current_payment: currentPayment,
      current_insurance: currentInsurance,
      current_maintenance: currentMaintenanceAnnual,
      current_trade_in: currentTradeIn,
      new_mpg: newMpg,
      new_gas_price: newGasPrice,
      new_payment: newPayment,
      new_insurance: newInsurance,
      new_maintenance: newMaintenanceAnnual,
      miles_per_month: milesPerMonth
    }

    // Calculate fuel costs
    const currentFuelCost = (milesPerMonth / currentMpg) * currentGasPrice
    const newFuelCost = (milesPerMonth / newMpg) * newGasPrice

    // Convert annual maintenance to monthly
    const currentMaintenance = currentMaintenanceAnnual / 12
    const newMaintenance = newMaintenanceAnnual / 12

    // Calculate totals (use adjusted payment for new car)
    const currentTotal = currentFuelCost + currentPayment + currentInsurance + currentMaintenance
    const newTotal = newFuelCost + adjustedNewPayment + newInsurance + newMaintenance

    // Calculate difference
    const difference = currentTotal - newTotal

    // Display results
    this.currentFuelCostTarget.textContent = `$${currentFuelCost.toFixed(2)}`
    this.currentPaymentDisplayTarget.textContent = `$${currentPayment.toFixed(2)}`
    this.currentInsuranceDisplayTarget.textContent = `$${currentInsurance.toFixed(2)}`
    this.currentMaintenanceDisplayTarget.textContent = `$${currentMaintenance.toFixed(2)}`
    this.currentTotalTarget.textContent = `$${currentTotal.toFixed(2)}`

    this.newFuelCostTarget.textContent = `$${newFuelCost.toFixed(2)}`
    this.newPaymentDisplayTarget.textContent = `$${adjustedNewPayment.toFixed(2)}`
    this.newInsuranceDisplayTarget.textContent = `$${newInsurance.toFixed(2)}`
    this.newMaintenanceDisplayTarget.textContent = `$${newMaintenance.toFixed(2)}`
    this.newTotalTarget.textContent = `$${newTotal.toFixed(2)}`

    // Display trade-in breakdown if there's a trade-in value
    if (currentTradeIn > 0) {
      this.tradeInBreakdownTarget.classList.remove('hidden')
      this.newCarCostDisplayTarget.textContent = `$${newCarCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
      this.tradeInValueDisplayTarget.textContent = `-$${currentTradeIn.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
      this.principalFinancedDisplayTarget.textContent = `$${adjustedPrincipal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
    } else {
      this.tradeInBreakdownTarget.classList.add('hidden')
    }

    // Display verdict
    if (difference > 0) {
      this.verdictTarget.className = 'mt-6 p-6 rounded-lg text-center bg-green-100 border-2 border-green-400'
      this.verdictTextTarget.className = 'text-2xl font-bold mb-2 text-green-800'
      this.verdictTextTarget.textContent = `You'll SAVE $${Math.abs(difference).toFixed(2)} per month! 💰`
      this.verdictDetailsTarget.className = 'text-lg text-green-700'
      this.verdictDetailsTarget.textContent = `That's $${(Math.abs(difference) * 12).toFixed(2)} per year in savings.`
    } else if (difference < 0) {
      this.verdictTarget.className = 'mt-6 p-6 rounded-lg text-center bg-red-100 border-2 border-red-400'
      this.verdictTextTarget.className = 'text-2xl font-bold mb-2 text-red-800'
      this.verdictTextTarget.textContent = `You'll LOSE $${Math.abs(difference).toFixed(2).toLocaleString('en-US')} per month! ⚠️`
      this.verdictDetailsTarget.className = 'text-lg text-red-700'
      this.verdictDetailsTarget.textContent = `The new car will cost you $${(Math.abs(difference) * 12).toFixed(2).toLocaleString('en-US')} more per year.`
    } else {
      this.verdictTarget.className = 'mt-6 p-6 rounded-lg text-center bg-gray-100 border-2 border-gray-400'
      this.verdictTextTarget.className = 'text-2xl font-bold mb-2 text-gray-800'
      this.verdictTextTarget.textContent = `Break Even`
      this.verdictDetailsTarget.className = 'text-lg text-gray-700'
      this.verdictDetailsTarget.textContent = `Both cars cost the same per month.`
    }

    // Show results
    this.resultsTarget.classList.remove('hidden')
    this.resultsTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

    // Mark results as displayed and update button state
    this.resultsDisplayed = true
    this.checkFormState()

    // Update URL with current form values for easy sharing
    const shareableUrl = this.generateShareableUrl()
    const urlParams = new URLSearchParams(new URL(shareableUrl).search)
    window.history.replaceState({}, '', '?' + urlParams.toString())
  }
}
