export enum UserStatus {
    await = 0,
    active = 1,
    suspend = 2,
    delete = 3
}


export enum OrderType {
    limit = 1,
    market,
    stopLimit,
    stopMarket,
    liquidation,
    takeProfit,
    stopLoss,
    open_fee = 101,
    close_fee,
    leverage, // 레버리지를 바꾸는 경우
    funding, // 펀딩의 경우
}

export enum FutureWalletHistoryCode {
    deposit = 1001,  // 지갑에서 future wallet 으로 변화 - future wallet, available balance 변화
    withdrawal, // future wallet 을 지갑에 다시 넣음 - future wallet, available balance 변화
    order_open = 2011,  // 오픈 주문을 넣는 경우 - order margin, available balance 가 변한다
    order_cancel, // 주문이 취소된 경우 - order margin, available balance 가 변한다.
    contract_open = 2021, // 오픈 주문이 체결되는 경우 - order margin, available balance 가 변환다.
    contract_close , // 클로즈 주문이 체결되는 경우 - future wallet, available balance 가 변한다.
    contract_liquidation = 2032,  // 청산에 의하여 클로주 주문이 체졀되는 경우 - future wallet, available balance 가 변한다.
    fee_open = 3010, // open 계약 수수로 - future wallet 이 변한다.
    fee_close=3021, // close 비용 - future wallet, available balance 가 변한다.
    leverage = 3030, // 레버리지를 변경하는 경우 - available balance 가 변한다.
    invest=3040, // 투자 금액을 변경하는 경우 - available balance 가 변한다.
    rebate = 4010,
    commission = 4020,
    funding = 4030
}

export enum WalletHistoryCode {
    deposit = 1001,  // 고객 입금
    withdrawal_future,  // future 에서 다시 지갑으로 입금
    deposit_commission,

    withdrawal=2001, // 출금
    deposit_future,// 지갑에 있는 돈을 future wallet 으로 바
    withdrawal_commission, //
    exchange = 3001, // 교환
    deposit_pending = 4001,
    withdrawal_pending = 4002,
    commission = 5001, // 커미션이라는 이익의 발생
}

export enum AccountingCode {
    blank = 0,
    // 자산 관련
    future_wallet = 2100,
    crypto_currency = 2200,
    fee = 2300,
    // 비용 관련
    close_fee = 3100, // 포지션을 줄이거나 닫을 때 발생하는 비용
    // 부채
    leverage_debt = 4100, // 레버리를 사용한 거래에서 발생하는 부채
    // 자본
    capital = 5100, // 지갑에서 거래를 위하여 future wallet 에 넣으면 자본이 증가
    // 손익
    pl_trade = 6110, // 거래로 생기는 손익
    pl_open_fee = 6120, // 오픈시 발생하는 수수료
    pl_funding= 6200, // 펀딩으로 생기는 손익
    pl_rebate = 6300, // 리베이트로 생기는 손익

    // 여기부터는 회사 Company PL 및 비용 에 필요한 추가 코드
    pl_exchange = 6400, // 화폐 교환으로 생기는 회사 손익
    pl_company_open_fee = 6510, // 고객 포지션 증가로 회사가 얻는 수수료
    pl_company_close_fee =6520, // 고객 포지션 감소로 회사가 얻는 수수료
    cost_agency_commission = 6600, // 수수료라는 비용의 발생
}


export enum OrderStatusCode {
    default = 1010,
    partially_done = 1020,
    complete = 2010,
    cancel_all = 3001, // 아무 계약도 이루어지지 않은 상태에서 사용자가 취소
    cancel_partially, // 부분 완료에서 사용자가 취소
    cancel_immediate, // ImmediateOrCancel 옵션으로 취소
    cancel_fill, //FillOrKill 옵션으로 취소
    cancel_post, // post only 옵션으로 취소
    cancel_reduce, // reduce only 옵션으로 취소
    cancel_profit_limit, // take profit limit 옵션 때문에 취소
    cancel_profit_market, // take profit market 옵션 때문에 취소
    cancel_balance, // available balance 부족으로 취소
    cancel_time_out, // 지정가 주문의 경우 3일이 지나면 취소
    cancel_quantity, // 포지션을 줄이는 주문에서 갖고 있는 수량이 요청한 수량보다 적어서 취소
    cancel_no_position,// 고객이 포지션을 정리하였거나 클로즈 주문이 겹쳐서 포지션이 없어진 경우
    change_all = 4030, // 아무 계약도 체결되지 않은 상태에서 고객이 수벙
    change_partial = 4040, // 부분 완료에서 고객이 수정
}

export enum LoggerCode{
    limit_contract_exception
}

export enum ContractConditionCode{
    GoodTillCancel= 1001,
    ImmediateOrCancel = 2001, // 즉시 체결가능한 수량만 체결하고 나머지는 취소
    FillOrKill=3001, // 주문 수량 전체가 즉시 체결되지 않으면 취소
}

export enum ContractExecCode{
    long_open = 2211, // Long 포지션을 열거나 늘리는 계약
    long_close = 2212, // Long 포지션을 닫거나 줄이는 계약
    long_stop_open,

    short_open = 2221,
    short_close = 2222,
    short_stop_open,

    liquidation = 2232,

    leverage_up = 2251,
    leverage_down = 2252,
    open_fee = 3101, // 포지션을 열거나 늘릴 때 발생하는 수수료 거래 계약
    close_fee = 3102, // 포지션을 닫거나 줄일 때 발생하는 수수료 거래 계약
    funding_profit = 6101,
    funding_lose= 6102,
    rebate = 6200,
    agency_fee = 6500
}

export enum ResponseCode{
    error = 0,
    success = 1,
    not_login = -1,
}

