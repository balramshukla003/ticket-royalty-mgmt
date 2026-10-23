export const ok = (res, data, message = 'Success') => {
    return res.status(200).json({ success: true, message, data });
};

export const created = (res, data, message = 'Created successfully') => {
    return res.status(201).json({ success: true, message, data });
};

export const paginated = (res, data, meta, message = 'Success') => {
    return res.status(200).json({ success: true, message, data, meta });
};

export const noContent = (res) => {
    return res.status(204).send();
};