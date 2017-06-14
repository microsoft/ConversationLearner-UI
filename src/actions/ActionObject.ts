interface ActionObject<T>{
  type: string;
  payload: T;
  error?: boolean;
  meta?: any;
}

export default ActionObject;