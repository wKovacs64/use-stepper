import * as React from 'react';
import { callAll } from './utils/call-all';
import { mergeRefs } from './utils/merge-refs';
import { sum } from './utils/decimals';
import { usePrevious } from './utils/use-previous';

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

export type FormProps = React.PropsWithRef<
  React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
>;

export type InputProps = React.PropsWithRef<
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>
>;

export type ButtonProps = React.PropsWithRef<
  React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>;

export interface Options {
  defaultValue?: number;
  step?: number;
  min?: number;
  max?: number;
  enableReinitialize?: boolean;
  stateReducer?: (state: State, action: Action) => State;
}

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
  (options?: Options): ReturnValue;
  actionTypes: typeof actionTypes;
  defaultReducer: (state: State, action: Action) => State;
}

// @ts-expect-error (`actionTypes` and `defaultReducer` are added at invocation time)
export const useStepper: UseStepper = ({
  defaultValue = 0,
  step = 1,
  min = -Number.MAX_VALUE,
  max = Number.MAX_VALUE,
  enableReinitialize = false,
  stateReducer: userReducer,
} = {}) => {
  const previousDefaultValue = usePrevious(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validValueClosestTo = React.useCallback(
    (newValue: number | string) => {
      const newValueNum = typeof newValue === 'number' ? newValue : Number.parseFloat(newValue);
      return String(Math.min(max, Math.max(newValueNum, min)));
    },
    [max, min],
  );

  const initialState: State = { value: String(defaultValue) };

  const defaultReducer = React.useCallback(
    (state: State, action: Action): State => {
      const currentNumericValue = Number.parseFloat(state.value);
      switch (action.type) {
        case actionTypes.increment: {
          const newValue = validValueClosestTo(sum(currentNumericValue, step));
          if (newValue !== state.value) {
            return { value: newValue };
          }
          return state;
        }
        case actionTypes.decrement: {
          const newValue = validValueClosestTo(sum(currentNumericValue, -step));
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
          /* c8 ignore start */
        }
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
        /* c8 ignore stop */
      }
    },
    [validValueClosestTo, defaultValue, step],
  );

  // Expose our internal/default reducer and action types
  useStepper.defaultReducer = defaultReducer;
  useStepper.actionTypes = actionTypes;

  const [{ value }, dispatch] = React.useReducer(userReducer || defaultReducer, initialState);

  const setValue = React.useCallback((newValue: string) => {
    dispatch({
      type: actionTypes.setValue,
      payload: newValue,
    });
  }, []);

  const setValueClosestTo = React.useCallback(
    (newValue: string): void => {
      setValue(validValueClosestTo(newValue));
    },
    [validValueClosestTo, setValue],
  );

  function handleIncrement() {
    dispatch({ type: actionTypes.increment });
  }

  function handleDecrement() {
    dispatch({ type: actionTypes.decrement });
  }

  function handleFocus() {
    if (inputRef.current !== null) {
      inputRef.current.value = value;
      inputRef.current.select();
    }
  }

  function handleBlur() {
    dispatch({ type: actionTypes.coerce });
  }

  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    setValue(ev.target.value);
  }

  function handleKeyDown(ev: React.KeyboardEvent<HTMLInputElement>) {
    switch (ev.key) {
      case 'ArrowUp': {
        dispatch({ type: actionTypes.coerce });
        handleIncrement();
        ev.preventDefault();
        break;
      }
      case 'ArrowDown': {
        dispatch({ type: actionTypes.coerce });
        handleDecrement();
        ev.preventDefault();
        break;
      }
      case 'Home': {
        setValueClosestTo(String(min));
        ev.preventDefault();
        break;
      }
      case 'End': {
        setValueClosestTo(String(max));
        ev.preventDefault();
        break;
      }
      default:
        break;
    }
  }

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (inputRef.current !== null) {
      inputRef.current.blur();
    }
  }

  function getFormProps(formProps: FormProps = {}): FormProps {
    const { onSubmit, ...otherFormProps } = formProps;
    return {
      ...otherFormProps,
      onSubmit: callAll(handleSubmit, onSubmit),
    };
  }

  function getIncrementProps(incrementProps: ButtonProps = {}): ButtonProps {
    const { onClick, ...otherIncrementProps } = incrementProps;
    return {
      ...otherIncrementProps,
      'aria-hidden': true,
      tabIndex: -1,
      disabled: value === String(max),
      onClick: callAll(handleIncrement, onClick),
    };
  }

  function getDecrementProps(decrementProps: ButtonProps = {}): ButtonProps {
    const { onClick, ...otherButtonProps } = decrementProps;
    return {
      ...otherButtonProps,
      'aria-hidden': true,
      tabIndex: -1,
      disabled: value === String(min),
      onClick: callAll(handleDecrement, onClick),
    };
  }

  function getInputProps(inputProps: InputProps = {}): InputProps {
    const { ref, onBlur, onFocus, onChange, onKeyDown, ...otherInputProps } = inputProps;
    return {
      ...otherInputProps,
      role: 'spinbutton',
      'aria-valuemin': min,
      'aria-valuemax': max,
      'aria-valuenow': Number.isNaN(Number.parseFloat(value))
        ? undefined
        : Number.parseFloat(value),
      'aria-valuetext': value,
      autoComplete: 'off',
      autoCorrect: 'off',
      spellCheck: 'false',
      type: 'text',
      value: String(value),
      ref: mergeRefs(ref, inputRef),
      onBlur: callAll(handleBlur, onBlur),
      onFocus: callAll(handleFocus, onFocus),
      onChange: callAll(handleChange, onChange),
      onKeyDown: callAll(handleKeyDown, onKeyDown),
    };
  }

  // If the `defaultValue` parameter changes and the current value is still the
  // original default value (e.g. the user hasn't changed it), update the value
  // to the new default. This behavior is enabled via the `enableReinitialize`
  // parameter.
  React.useEffect(() => {
    if (
      enableReinitialize &&
      previousDefaultValue !== defaultValue &&
      previousDefaultValue === Number.parseFloat(value)
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
    value,
    setValue: setValueClosestTo,
    increment: handleIncrement,
    decrement: handleDecrement,
    getFormProps,
    getInputProps,
    getIncrementProps,
    getDecrementProps,
  };
};
