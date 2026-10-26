import { useQuery }   from '@tanstack/react-query'
import bookApi         from '../../api/book.api.js'
import Badge           from '../../components/ui/Badge.jsx'
import EmptyState      from '../../components/ui/EmptyState.jsx'
import { PageSpinner } from '../../components/ui/Spinner.jsx'
import { fmtRupee, fmtDate } from '../../utils/helpers.js'
import { BookOpen, Clock } from 'lucide-react'

const BookCard = ({ book }) => {
  const inProd = book.isInProduction

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-text-base leading-snug">{book.title}</h3>
          <p className="text-xs text-text-muted mt-0.5">{book.genre} · ISBN: {book.isbn}</p>
        </div>
        <Badge
          variant={inProd ? 'IN_PROGRESS' : 'RESOLVED'}
          label={book.statusLabel}
        />
      </div>

      {inProd ? (
        /* In-production state */
        <div className="flex items-center gap-2 text-sm text-text-muted bg-info-light
                        border border-info/20 rounded-lg px-4 py-3">
          <Clock size={15} className="text-info shrink-0" />
          <span>{book.statusLabel} — royalty data will appear after publication.</span>
        </div>
      ) : (
        /* Published — royalty grid */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'MRP',          value: fmtRupee(book.mrp) },
            { label: 'Copies Sold',  value: book.copiesSold?.toLocaleString('en-IN') },
            { label: 'Total Earned', value: fmtRupee(book.royaltyEarned) },
            { label: 'Royalty Paid', value: fmtRupee(book.royaltyPaid) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-alt rounded-lg p-3">
              <p className="text-[11px] text-text-muted uppercase tracking-wide">{label}</p>
              <p className="text-base font-semibold text-text-base mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending highlight */}
      {!inProd && book.royaltyPending > 0 && (
        <div className="flex items-center justify-between text-sm bg-warning-light
                        border border-warning/20 rounded-lg px-4 py-2">
          <span className="text-warning-dark font-medium">Royalty Pending</span>
          <span className="font-bold text-warning-dark">{fmtRupee(book.royaltyPending)}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-text-muted pt-1 border-t border-border">
        <span>Print: {book.printPartner || '—'}</span>
        <span>
          {book.availableOn?.length > 0
            ? book.availableOn.map((p) => p.label).join(', ')
            : 'Not yet listed'}
        </span>
        {book.lastPayoutDate && (
          <span>Last payout: {fmtDate(book.lastPayoutDate)}</span>
        )}
      </div>
    </div>
  )
}

const MyBooksPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-books'],
    queryFn:  () => bookApi.getMyBooks(),
  })

  if (isLoading) return <PageSpinner />

  const books   = data?.data?.books   || []
  const summary = data?.data?.summary || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-base">My Books</h1>
        <p className="text-text-muted text-sm mt-1">
          {summary.publishedBooks} published · {summary.inProductionBooks} in production
        </p>
      </div>

      {books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books yet" description="Your published books will appear here." />
      ) : (
        <div className="space-y-4">
          {books.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </div>
  )
}

export default MyBooksPage
