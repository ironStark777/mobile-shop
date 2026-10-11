import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InitialLoading } from './InitialLoading';

describe('InitialLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('anuncia la carga y, si pasan 5 segundos, avisa de que el servicio está tardando', () => {
    render(<InitialLoading />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/^Cargando…$/);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(status).toHaveTextContent(
      'Cargando… El servicio está tardando en responder; puede tardar más de un minuto.',
    );
  });
});
