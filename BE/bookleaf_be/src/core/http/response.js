export const ok = (res, data, message = 'Success') =>
  res.status(200).json({ success: true, message, data });

export const created = (res, data, message = 'Created successfully') =>
  res.status(201).json({ success: true, message, data });

export const paginated = (res, data, meta, message = 'Success') =>
  res.status(200).json({ success: true, message, data, meta });

export const noContent = (res) =>
  res.status(204).send();
