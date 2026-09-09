const categories = ['Roads', 'Lighting', 'Waste', 'Water', 'Public spaces'];
const statuses = ['Reported', 'In progress', 'Resolved'];
const badgeDefinitions = [
  { id: 'first-step', name: 'First step', threshold: 1, metric: 'reports' },
  { id: 'local-observer', name: 'Local observer', threshold: 5, metric: 'reports' },
  { id: 'neighborhood-champion', name: 'Neighborhood champion', threshold: 20, metric: 'reports' },
  { id: 'positive-change', name: 'Positive change', threshold: 1, metric: 'resolved' },
  { id: 'lasting-impact', name: 'Lasting impact', threshold: 10, metric: 'resolved' },
];
function achievements(reports, resolved) {
  const stats = { reports: Math.max(0, reports), resolved: Math.max(0, resolved) };
  return {
    ...stats,
    points: stats.reports * 5 + stats.resolved * 10,
    badges: badgeDefinitions.filter((b) => stats[b.metric] >= b.threshold).map((b) => b.id),
  };
}
function contribution(issue) {
  if (!issue) return null;
  const created = issue.createdAt?.toMillis?.() ?? 0;
  const updated = issue.updatedAt?.toMillis?.() ?? created;
  return {
    ownerId: issue.ownerId,
    category: issue.category,
    status: issue.status,
    severity: issue.severity,
    day: new Date(created).toISOString().slice(0, 10),
    resolutionHours: issue.status === 'Resolved' ? Math.max(0, updated - created) / 3600000 : 0,
  };
}
function adjust(summary, item, direction) {
  if (!item) return summary;
  summary.total = Math.max(0, (summary.total || 0) + direction);
  for (const [key, value] of [
    ['byStatus', item.status],
    ['byCategory', item.category],
    ['bySeverity', item.severity],
    ['byDay', item.day],
  ]) {
    summary[key] = {
      ...summary[key],
      [value]: Math.max(0, (summary[key]?.[value] || 0) + direction),
    };
  }
  summary.resolutionHours = Math.max(
    0,
    (summary.resolutionHours || 0) + item.resolutionHours * direction,
  );
  return summary;
}
function publicIssue(id, data) {
  return {
    id,
    reference: `CF-${id}`,
    title: data.title,
    description: data.description,
    category: data.category,
    severity: data.severity,
    status: data.status,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
    photos: (data.photos || []).map((p) => ({ url: p.url })),
    confirmations: Object.keys(data.confirmedBy || {}).length,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
  };
}
module.exports = {
  categories,
  statuses,
  badgeDefinitions,
  achievements,
  contribution,
  adjust,
  publicIssue,
};
