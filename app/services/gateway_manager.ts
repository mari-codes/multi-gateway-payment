import axios from 'axios'
import env from '#start/env'
import Gateway from '#models/gateway'

export type GatewayChargeInput = {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export type GatewayChargeResult = {
  externalId: string | null
}

export interface GatewayClient {
  name: string
  charge(input: GatewayChargeInput): Promise<GatewayChargeResult>
  refund(externalId: string): Promise<void>
}

export class GatewayChargeError extends Error {
  constructor(
    message: string,
    public lastGateway: Gateway | null
  ) {
    super(message)
  }
}

class Gateway1Client implements GatewayClient {
  name = 'gateway_1'
  private baseUrl = env.get('GATEWAY_1_URL')
  private email = env.get('GATEWAY_1_EMAIL')
  private token = env.get('GATEWAY_1_TOKEN')

  private async getBearerToken(): Promise<string> {
    const response = await axios.post(
      `${this.baseUrl}/login`,
      { email: this.email, token: this.token },
      { validateStatus: () => true }
    )
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Gateway 1 login failed with status ${response.status}`)
    }

    const data = response.data ?? {}
    const bearer =
      data.token ||
      data.access_token ||
      data.accessToken ||
      data.data?.token ||
      data.data?.access_token
    if (!bearer) {
      throw new Error('Gateway 1 login did not return a token')
    }

    return bearer
  }

  async charge(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    const bearer = await this.getBearerToken()
    const response = await axios.post(
      `${this.baseUrl}/transactions`,
      {
        amount: input.amount,
        name: input.name,
        email: input.email,
        cardNumber: input.cardNumber,
        cvv: input.cvv,
      },
      {
        headers: { Authorization: `Bearer ${bearer}` },
        validateStatus: () => true,
      }
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Gateway 1 charge failed with status ${response.status}`)
    }

    const data = response.data ?? {}
    const externalId = data.id || data.transactionId || data.external_id || data.data?.id || null
    return { externalId }
  }

  async refund(externalId: string): Promise<void> {
    const bearer = await this.getBearerToken()
    const response = await axios.post(
      `${this.baseUrl}/transactions/${externalId}/charge_back`,
      {},
      {
        headers: { Authorization: `Bearer ${bearer}` },
        validateStatus: () => true,
      }
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Gateway 1 refund failed with status ${response.status}`)
    }
  }
}

class Gateway2Client implements GatewayClient {
  name = 'gateway_2'
  private baseUrl = env.get('GATEWAY_2_URL')
  private authToken = env.get('GATEWAY_2_AUTH_TOKEN')
  private authSecret = env.get('GATEWAY_2_AUTH_SECRET')

  private headers() {
    return {
      'Gateway-Auth-Token': this.authToken,
      'Gateway-Auth-Secret': this.authSecret,
    }
  }

  async charge(input: GatewayChargeInput): Promise<GatewayChargeResult> {
    const response = await axios.post(
      `${this.baseUrl}/transacoes`,
      {
        valor: input.amount,
        nome: input.name,
        email: input.email,
        numeroCartao: input.cardNumber,
        cvv: input.cvv,
      },
      {
        headers: this.headers(),
        validateStatus: () => true,
      }
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Gateway 2 charge failed with status ${response.status}`)
    }

    const data = response.data ?? {}
    const externalId = data.id || data.transactionId || data.external_id || data.data?.id || null
    return { externalId }
  }

  async refund(externalId: string): Promise<void> {
    const response = await axios.post(
      `${this.baseUrl}/transacoes/reembolso`,
      { id: externalId },
      {
        headers: this.headers(),
        validateStatus: () => true,
      }
    )

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Gateway 2 refund failed with status ${response.status}`)
    }
  }
}

const gatewayClients: Record<string, GatewayClient> = {
  gateway_1: new Gateway1Client(),
  gateway_2: new Gateway2Client(),
}

const normalizeGatewayName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '_')

export class GatewayManager {
  async charge(input: GatewayChargeInput) {
    const gateways = await Gateway.query().where('isActive', true).orderBy('priority', 'asc')
    if (gateways.length === 0) {
      throw new GatewayChargeError('No active gateways available', null)
    }

    const errors: string[] = []
    let lastGateway: Gateway | null = null
    for (const gateway of gateways) {
      lastGateway = gateway
      const key = normalizeGatewayName(gateway.name)
      const client = gatewayClients[key]
      if (!client) {
        errors.push(`Gateway "${gateway.name}" is not supported`)
        continue
      }

      try {
        const result = await client.charge(input)
        return { gateway, externalId: result.externalId }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown gateway error')
      }
    }

    throw new GatewayChargeError(errors.join('; '), lastGateway)
  }

  async refund(gatewayName: string, externalId: string) {
    const key = normalizeGatewayName(gatewayName)
    const client = gatewayClients[key]
    if (!client) {
      throw new Error(`Gateway "${gatewayName}" is not supported`)
    }

    await client.refund(externalId)
  }
}
