import * as React from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useStepper, {
  type Options,
  type State,
  type Action,
} from '../use-stepper';

function Counter(props: Options): JSX.Element {
  const {
    setValue,
    getFormProps,
    getInputProps,
    getIncrementProps,
    getDecrementProps,
  } = useStepper(props);

  return (
    <form {...getFormProps()}>
      <button type="button" {...getDecrementProps()}>
        decrement
      </button>
      <input {...getInputProps()} />
      <button type="button" {...getIncrementProps()}>
        increment
      </button>
      <button
        data-testid="set-value-to-42"
        type="button"
        onClick={() => setValue('42')}
      >
        set value to 42
      </button>
      <button type="submit">submit</button>
    </form>
  );
}

function renderForm(options: Options = {}): { value: string } & RenderResult {
  const utils = render(<Counter {...options} />);
  const { value } = screen.getByRole('textbox') as HTMLInputElement;
  return { value, ...utils };
}

describe('useStepper', () => {
  it('exports a function', () => {
    expect(useStepper).toBeInstanceOf(Function);
  });

  it('returns a value even when no options are specified', () => {
    const { result } = renderHook(() => useStepper());
    expect(Number.isNaN(parseFloat(result.current.value))).toBeFalsy();
  });

  it('honors the defaultValue parameter', () => {
    const { result } = renderHook(() => useStepper({ defaultValue: 42 }));
    expect(result.current.value).toBe('42');
  });

  it('returns the correct properties', () => {
    const { result } = renderHook(() => useStepper());
    expect(result.current).toMatchInlineSnapshot(`
      {
        "decrement": [Function],
        "getDecrementProps": [Function],
        "getFormProps": [Function],
        "getIncrementProps": [Function],
        "getInputProps": [Function],
        "increment": [Function],
        "setValue": [Function],
        "value": "0",
      }
    `);
  });

  it('provides the correct form props in getFormProps', () => {
    const { result } = renderHook(() => useStepper());
    expect(result.current.getFormProps()).toMatchInlineSnapshot(`
      {
        "onSubmit": [Function],
      }
    `);
  });

  it('provides the correct input props in getInputProps', () => {
    const { result } = renderHook(() => useStepper());
    expect(result.current.getInputProps()).toMatchInlineSnapshot(`
      {
        "onBlur": [Function],
        "onChange": [Function],
        "onFocus": [Function],
        "ref": [Function],
        "type": "text",
        "value": "0",
      }
    `);
  });

  it('provides the correct decrement props in getDecrementProps', () => {
    const { result } = renderHook(() => useStepper());
    expect(result.current.getDecrementProps()).toMatchInlineSnapshot(`
      {
        "onClick": [Function],
      }
    `);
  });

  it('provides the correct increment props in getIncrementProps', () => {
    const { result } = renderHook(() => useStepper());
    expect(result.current.getIncrementProps()).toMatchInlineSnapshot(`
      {
        "onClick": [Function],
      }
    `);
  });

  it('constrains setValue calls to min and max', () => {
    const { result } = renderHook(() =>
      useStepper({
        min: 1,
        max: 2,
        defaultValue: 1,
      }),
    );

    expect(result.current.value).toBe('1');
    act(() => result.current.setValue('2'));
    expect(result.current.value).toBe('2');
    act(() => result.current.setValue('3'));
    expect(result.current.value).toBe('2');
  });

  it('constrains increment/decrement to min and max', () => {
    const { result } = renderHook(() =>
      useStepper({
        min: 1,
        max: 2,
        defaultValue: 1,
      }),
    );

    expect(result.current.value).toBe('1');
    act(() => result.current.decrement());
    expect(result.current.value).toBe('1');
    act(() => result.current.increment());
    expect(result.current.value).toBe('2');
    act(() => result.current.increment());
    expect(result.current.value).toBe('2');
  });

  it('selects input value on focus', async () => {
    const user = userEvent.setup();

    renderForm();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input.selectionStart).toBe(input.value.length);
    expect(input.selectionEnd).toBe(input.value.length);

    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('updates current value on blur', async () => {
    const user = userEvent.setup();

    const min = 1;
    const max = 10;
    const defaultValue = 5;
    renderForm({ defaultValue, min, max });
    const input = screen.getByRole('textbox') as HTMLInputElement;

    expect(input).toHaveValue(String(defaultValue));

    await user.click(input);
    await user.clear(input);
    await user.type(input, String(max + 1));
    await user.tab();

    expect(input).toHaveValue(String(max));

    await user.click(input);
    await user.clear(input);
    await user.type(input, String(min - 1));
    await user.tab();

    expect(input).toHaveValue(String(min));

    await user.click(input);
    await user.clear(input);
    await user.type(input, '-');
    await user.tab();

    expect(input).toHaveValue(String(defaultValue));
  });

  it('blurs input on submit', async () => {
    const user = userEvent.setup();

    renderForm();
    const input = screen.getByRole('textbox');

    input.focus();
    expect(input).toHaveFocus();

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(input).not.toHaveFocus();
  });

  it('handles decimals', () => {
    const { result } = renderHook(() =>
      useStepper({ defaultValue: 1, step: 0.25 }),
    );

    expect(result.current.value).toBe('1');
    act(() => result.current.decrement());
    expect(result.current.value).toBe('0.75');
    act(() => result.current.increment());
    act(() => result.current.increment());
    expect(result.current.value).toBe('1.25');
    act(() => result.current.setValue('-0.5'));
    expect(result.current.value).toBe('-0.5');
    act(() => result.current.decrement());
    expect(result.current.value).toBe('-0.75');
  });

  it('accepts a custom reducer', () => {
    /* eslint-disable jest/no-conditional-in-test */
    const hasCents = (str: string) => str.split('.').length === 2;
    const dollars = (str: string) => str.split('.')[0];

    function getPreviousEvenDollar(value: number) {
      const str = String(value);
      return hasCents(str) ? dollars(str) : dollars(String(value - 1));
    }

    function getNextEvenDollar(value: number) {
      return dollars(String(value + 1));
    }

    function dollarReducer(state: State, action: Action) {
      const currentNumericValue = parseFloat(state.value);
      switch (action.type) {
        case useStepper.actionTypes.increment: {
          const newValue = parseInt(getNextEvenDollar(currentNumericValue), 10);
          if (newValue !== currentNumericValue) {
            return { ...state, value: String(newValue) };
          }
          return state;
        }
        case useStepper.actionTypes.decrement: {
          const newValue = parseInt(
            getPreviousEvenDollar(currentNumericValue),
            10,
          );
          if (newValue !== currentNumericValue) {
            return { ...state, value: String(newValue) };
          }
          return state;
        }
        case useStepper.actionTypes.coerce: {
          return state;
        }
        case useStepper.actionTypes.setValue: {
          if (action.payload !== undefined && action.payload !== state.value) {
            return { value: String(action.payload) };
          }
          return state;
        }
        default:
          return useStepper.defaultReducer(state, action);
      }
    }
    /* eslint-enable jest/no-conditional-in-test */

    const { result } = renderHook(() =>
      useStepper({ stateReducer: dollarReducer }),
    );

    act(() => result.current.setValue('4.25'));
    expect(result.current.value).toBe('4.25');
    act(() => result.current.increment());
    expect(result.current.value).toBe('5');

    act(() => result.current.setValue('0.25'));
    expect(result.current.value).toBe('0.25');
    act(() => result.current.decrement());
    expect(result.current.value).toBe('0');
  });

  describe('enableReinitialize', () => {
    it('true: value is updated to new default if defaultValue changes and value has not been modified', () => {
      const { result, rerender } = renderHook((opts) => useStepper(opts), {
        initialProps: { enableReinitialize: true, defaultValue: 33 },
      });

      expect(result.current.value).toBe('33');
      rerender({ enableReinitialize: true, defaultValue: 42 });
      expect(result.current.value).toBe('42');
    });

    it('true: value is not updated to new default if defaultValue changes and value has been modified', () => {
      const { result, rerender } = renderHook((opts) => useStepper(opts), {
        initialProps: { enableReinitialize: true, defaultValue: 33 },
      });

      expect(result.current.value).toBe('33');
      act(() => result.current.increment());
      expect(result.current.value).toBe('34');
      rerender({ enableReinitialize: true, defaultValue: 42 });
      expect(result.current.value).toBe('34');
    });

    it('false: value remains unchanged if defaultValue changes', () => {
      const { result, rerender } = renderHook((opts) => useStepper(opts), {
        initialProps: { defaultValue: 33 },
      });

      expect(result.current.value).toBe('33');
      rerender({ defaultValue: 42 });
      expect(result.current.value).toBe('33');
    });
  });

  describe('should work with decimals', () => {
    // it('when the step is a decimal', () => {
    //   const { result } = renderHook((opts) => useStepper(opts), {
    //     initialProps: {
    //       step: 0.11,
    //       defaultValue: 3,
    //     },
    //   });

    //   expect(result.current.value).toBe('3');
    //   act(() => result.current.increment());
    //   expect(result.current.value).toBe('3.11');
    //   act(() => result.current.increment());
    //   expect(result.current.value).toBe('3.22');
    //   act(() => result.current.decrement());
    //   expect(result.current.value).toBe('3.11');
    //   act(() => result.current.decrement());
    //   expect(result.current.value).toBe('3.00');
    // });

    it('when the value is a decimal', () => {
      const { result } = renderHook((opts) => useStepper(opts), {
        initialProps: {
          step: 1,
          defaultValue: 0.5,
        },
      });

      act(() => result.current.increment());
      expect(result.current.value).toBe('1.5');
      act(() => result.current.increment());
      expect(result.current.value).toBe('2.5');
      act(() => result.current.decrement());
      expect(result.current.value).toBe('1.5');
      act(() => result.current.decrement());
      expect(result.current.value).toBe('0.5');
    });
  });
});
