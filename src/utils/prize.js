export const getPrizeLabel = (saves = 0, total = 2) => {
  const safeSaves = Number.isFinite(Number(saves)) ? Number(saves) : 0;
  const safeTotal = Number.isFinite(Number(total)) ? Number(total) : 2;

  if (safeSaves >= safeTotal) {
    return '1 camiseta para apoyar a la selección';
  }

  if (safeSaves === 1) {
    return 'Balón';
  }

  return 'Tomatodo';
};