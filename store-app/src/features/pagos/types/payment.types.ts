export interface PreferenceResponse {
  preference_id: string;
  init_point: string;
  pedido_id: number;
}

export interface PagoStatusResponse {
  id: number;
  pedido_id: number;
  mp_status: string;
  mp_status_detail: string | null;
  transaction_amount: number;
  payment_method_id: string | null;
  external_reference: string;
}
