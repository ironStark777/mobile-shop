import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import type { ProductSummary } from '../../entities/product/product';
import { ProductCard } from './ProductCard';

const product: ProductSummary = {
  id: 'ZmGrkLRPXOTpxsU4jjAcv',
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: 170,
  imageUrl: 'https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg',
};

function renderCard(overrides: Partial<ProductSummary> = {}) {
  render(
    <MemoryRouter>
      <ProductCard product={{ ...product, ...overrides }} />
    </MemoryRouter>,
  );
}

describe('ProductCard', () => {
  it('enlaza al detalle del producto con la marca y el modelo como nombre', () => {
    renderCard();

    const link = screen.getByRole('link', { name: 'Acer Iconia Talk S' });
    expect(link).toHaveAttribute('href', '/product/ZmGrkLRPXOTpxsU4jjAcv');
  });

  it('muestra el precio en euros', () => {
    renderCard();

    expect(screen.getByText('170 €')).toBeInTheDocument();
  });

  it('indica cuando el producto no tiene precio', () => {
    renderCard({ price: null });

    expect(screen.getByText('Precio no disponible')).toBeInTheDocument();
  });
});
