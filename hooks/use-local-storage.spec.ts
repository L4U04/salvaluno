import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { act } from 'react';
import { renderHook } from '@testing-library/react';

// Ensure jsdom environment for Vitest: DON'T DELETE THIS!
// @vitest-environment jsdom

describe('useLocalStorage Hook', () => {
  const key = 'test-key';
  const initialValue = 'initial';

  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};
    if (typeof window === 'undefined') {
      // @ts-expect-error: Assigning window to global for jsdom test environment setup
      global.window = {};
    }
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((k: string) => localStorageMock[k] || null),
        setItem: vi.fn((k: string, v: string) => {
          localStorageMock[k] = v;
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should read and parse value from localStorage', () => {
    const storedValue = 'stored';

    window.localStorage.setItem(key, JSON.stringify(storedValue));

    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current[0]).toBe(storedValue);
  });

  it('should handle read error and return initial value', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    window.localStorage.getItem = vi.fn(() => '{invalid json}');

    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    expect(result.current[0]).toBe(initialValue);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao ler a chave'),
      expect.any(Error),
    );

    consoleWarnSpy.mockRestore();
  });

  it('should update value and save to localStorage', () => {
    const newValue = 'updated';

    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toBe(newValue);

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(newValue),
    );
  });

  it('should handle write error', () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const newValue = 'updated';

    window.localStorage.setItem = vi.fn(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage(key, initialValue));

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toBe(newValue);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao salvar a chave'),
      expect.any(Error),
    );

    consoleWarnSpy.mockRestore();
  });
});
