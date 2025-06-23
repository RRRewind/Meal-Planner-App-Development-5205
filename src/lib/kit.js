// Kit (ConvertKit) API integration
const KIT_API_KEY = process.env.REACT_APP_KIT_API_KEY
const KIT_API_SECRET = process.env.REACT_APP_KIT_API_SECRET
const KIT_FORM_ID = process.env.REACT_APP_KIT_FORM_ID

class KitAPI {
  constructor() {
    this.baseURL = 'https://api.convertkit.com/v3'
    this.apiKey = KIT_API_KEY
    this.apiSecret = KIT_API_SECRET
    this.formId = KIT_FORM_ID
  }

  async subscribeToNewsletter(email, firstName = '', lastName = '', tags = []) {
    if (!this.apiKey || !this.formId) {
      console.warn('Kit API credentials not configured')
      return { success: false, error: 'Kit API not configured' }
    }

    try {
      const response = await fetch(`${this.baseURL}/forms/${this.formId}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          email,
          first_name: firstName,
          last_name: lastName,
          tags: tags.join(',')
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Subscription failed' }
      }
    } catch (error) {
      console.error('Kit subscription error:', error)
      return { success: false, error: error.message }
    }
  }

  async addTag(subscriberId, tagName) {
    if (!this.apiSecret) {
      return { success: false, error: 'Kit API secret not configured' }
    }

    try {
      const response = await fetch(`${this.baseURL}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_secret: this.apiSecret,
          tag: {
            name: tagName
          }
        })
      })

      const data = await response.json()
      return { success: response.ok, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export const kitAPI = new KitAPI()
export default kitAPI