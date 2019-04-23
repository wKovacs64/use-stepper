import React from 'react';
import mergeRefs from './utils/merge-refs';
import callAll from './utils/call-all';
import usePrevious from './utils/use-previous';

const actionTypes = {
  increment: 'increment',
  decrement: 'decrement',
  coerce: 'coerce',
  setValue: 'setValue',
};

export interface State {
  value: string;
}

export interface Action {
  type: string;
  payload?: string;
}

export interface Options {
  defaultValue?: number;
  step?: number;
  min?: number;
  max?: number;
  onNewValue?: (newValue: number) => void;
  enableReinitialize?: boolean;
  stateReducer?: (state: State, action: Action) => State;
}

export type FormProps = React.PropsWithRef<
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >
>;

export type InputProps = React.PropsWithRef<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
>;

export type ButtonProps = React.PropsWithRef<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>;

export interface ReturnValue {
  value: string;
  setValue: (newValue: string) => void;
  increment: () => void;
  decrement: () => void;
  getFormProps: (formProps?: FormProps) => FormProps;
  getInputProps: (inputProps?: InputProps) => InputProps;
  getIncrementProps: (incrementProps?: ButtonProps) => ButtonProps;
  getDecrementProps: (decrementProps?: ButtonProps) => ButtonProps;
}

export interface UseStepper {
  (options: Options): ReturnValue;
  actionTypes: typeof actionTypes;
  defaultReducer: (state: State, action: Action) => State;
}

function useStepper({
  defaultValue = 0,
  step = 1,
  min = -Number.MAX_VALUE,
  max = Number.MAX_VALUE,
  onNewValue = undefined,
  enableReinitialize = false,
  stateReducer: userReducer,
}: Options = {}): ReturnValue {
  const previousDefaultValue = usePrevious(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validValueClosestTo: (newValue: number) => string = React.useCallback(
    newValue => {
      return String(Math.min(max, Math.max(newValue, min)));
    },
    [max, min],
  );

  const initialState: State = { value: String(defaultValue) };

  const defaultReducer = React.useCallback(
    (state: State, action: Action): State => {
      const currentNumericValue = parseFloat(state.value);
      switch (action.type) {
        case actionTypes.increment: {
          const newValue = validValueClosestTo(currentNumericValue + step);
          if (newValue !== state.value) {
            return { value: newValue };
          }
          return state;
        }
        case actionTypes.decrement: {
          const newValue = validValueClosestTo(currentNumericValue - step);
          if (newValue !== state.value) {
            return { value: newValue };
          }
          return state;
        }
        case actionTypes.coerce: {
          if (Number.isNaN(currentNumericValue)) {
            return { value: String(defaultValue) };
          }
          const newValue = validValueClosestTo(currentNumericValue);
          if (newValue !== state.value) {
            return { value: newValue };
          }
          return state;
        }
        case actionTypes.setValue: {
          if (action.payload !== undefined && action.payload !== state.value) {
            return { value: action.payload };
          }
          return state;
        }
        /* istanbul ignore next: this will never happen */
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    },
    [validValueClosestTo, defaultValue, step],
  );

  // Expose our internal/default reducer and action types
  (useStepper as UseStepper).defaultReducer = defaultReducer;
  (useStepper as UseStepper).actionTypes = actionTypes;

  const [{ value }, dispatch] = React.useReducer(
    userReducer || defaultReducer,
    initialState,
  );

  const setValue = React.useCallback(newValue => {
    dispatch({
      type: actionTypes.setValue,
      payload: newValue,
    });
  }, []);

  const setValueClosestTo = React.useCallback(
    newValue => {
      setValue(validValueClosestTo(newValue));
    },
    [validValueClosestTo, setValue],
  );

  const handleIncrement = (): void => {
    dispatch({ type: actionTypes.increment });
  };

  const handleDecrement = (): void => {
    dispatch({ type: actionTypes.decrement });
  };

  const handleFocus = (): void => {
    /* istanbul ignore else: not worth testing */
    if (inputRef.current !== null) {
      inputRef.current.value = value;
      inputRef.current.select();
    }
  };

  const handleBlur = (): void => {
    dispatch({ type: actionTypes.coerce });
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (
    ev,
  ): void => {
    setValue(ev.target.value);
  };

  const handleSubmit: React.FormEventHandler = (ev): void => {
    ev.preventDefault();
    /* istanbul ignore else: not worth testing */
    if (inputRef.current !== null) {
      inputRef.current.blur();
    }
  };

  const getFormProps = (formProps: FormProps = {}): FormProps => {
    const { onSubmit, ...otherFormProps } = formProps;
    return {
      ...otherFormProps,
      onSubmit: callAll(handleSubmit, onSubmit),
    };
  };

  const getIncrementProps = (incrementProps: ButtonProps = {}): ButtonProps => {
    const { onClick, ...otherIncrementProps } = incrementProps;
    return {
      ...otherIncrementProps,
      onClick: callAll(handleIncrement, onClick),
    };
  };

  const getDecrementProps = (decrementProps: ButtonProps = {}): ButtonProps => {
    const { onClick, ...otherButtonProps } = decrementProps;
    return {
      ...otherButtonProps,
      onClick: callAll(handleDecrement, onClick),
    };
  };

  const getInputProps = (inputProps: InputProps = {}): InputProps => {
    const { ref, onBlur, onFocus, onChange, ...otherInputProps } = inputProps;
    return {
      ...otherInputProps,
      type: 'text',
      value: String(value),
      ref: mergeRefs(ref, inputRef),
      onBlur: callAll(handleBlur, onBlur),
      onFocus: callAll(handleFocus, onFocus),
      onChange: callAll(handleChange, onChange),
    };
  };

  // Notify the caller when the value has been updated to a valid number
  React.useEffect(() => {
    const numericValue = parseFloat(value);
    if (typeof onNewValue === 'function' && !Number.isNaN(numericValue)) {
      onNewValue(numericValue);
    }
  }, [onNewValue, value]);

  // If the `defaultValue` parameter changes and the current value is still the
  // original default value (e.g. the user hasn't changed it), update the value
  // to the new default. This behavior is enabled via the `enableReinitialize`
  // parameter.
  React.useEffect(() => {
    if (
      enableReinitialize &&
      previousDefaultValue !== defaultValue &&
      previousDefaultValue === parseFloat(value)
    ) {
      setValue(validValueClosestTo(defaultValue));
    }
  }, [
    enableReinitialize,
    defaultValue,
    previousDefaultValue,
    value,
    validValueClosestTo,
    setValue,
  ]);

  return {
    value: String(value),
    setValue: setValueClosestTo,
    increment: handleIncrement,
    decrement: handleDecrement,
    getFormProps,
    getInputProps,
    getIncrementProps,
    getDecrementProps,
  };
}

export default useStepper as UseStepper;
