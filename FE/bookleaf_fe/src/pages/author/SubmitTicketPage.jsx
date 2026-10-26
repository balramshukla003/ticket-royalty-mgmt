import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import bookApi   from '../../api/book.api.js'
import ticketApi from '../../api/ticket.api.js'
import Input     from '../../components/ui/Input.jsx'
import Select    from '../../components/ui/Select.jsx'
import Textarea  from '../../components/ui/Textarea.jsx'
import Button    from '../../components/ui/Button.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Paperclip, Send } from 'lucide-react'

const SubmitTicketPage = () => {
  const navigate = useNavigate()
  const toast    = useToast()

  const [form, setForm]     = useState({ bookId: '', subject: '', description: '' })
  const [errors, setErrors] = useState({})

  const { data: dropdownData } = useQuery({
    queryKey: ['books-dropdown'],
    queryFn:  () => bookApi.getDropdown(),
  })

  const books = dropdownData?.data || []

  const bookOptions = [
    { value: '', label: 'General / Account Level' },
    ...books.map((b) => ({ value: String(b.id), label: b.title })),
  ]

  const validate = () => {
    const e = {}
    if (!form.subject.trim() || form.subject.length < 5)
      e.subject = 'Subject must be at least 5 characters'
    if (!form.description.trim() || form.description.length < 20)
      e.description = 'Description must be at least 20 characters'
    return e
  }

  const mutation = useMutation({
    mutationFn: (data) => ticketApi.create(data),
    onSuccess: (res) => {
      toast({ type: 'success', title: 'Ticket submitted!', message: `${res.data.ticketCode} has been created.` })
      navigate('/tickets')
    },
    onError: (err) => {
      toast({ type: 'error', title: 'Failed to submit', message: err.message })
    },
  })

  const onSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    mutation.mutate({
      bookId:      form.bookId ? parseInt(form.bookId) : null,
      subject:     form.subject,
      description: form.description,
    })
  }

  const onChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: '' }))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-base">Submit a Support Query</h1>
        <p className="text-text-muted text-sm mt-1">
          Describe your issue and our team will respond as soon as possible.
        </p>
      </div>

      <div className="card p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <Select
            label="Related Book"
            options={bookOptions}
            value={form.bookId}
            onChange={onChange('bookId')}
          />

          <Input
            label="Subject"
            placeholder="e.g. My royalty payment is delayed"
            value={form.subject}
            onChange={onChange('subject')}
            error={errors.subject}
            maxLength={200}
          />

          <Textarea
            label="Description"
            placeholder="Please describe your issue in detail. Include any relevant dates, ISBNs, or amounts."
            value={form.description}
            onChange={onChange('description')}
            error={errors.description}
            rows={6}
          />

          {/* File attachment UI only */}
          <div>
            <label className="label">Attachments (optional)</label>
            <div className="border-2 border-dashed border-border rounded-lg px-4 py-6 text-center
                            text-text-muted text-sm hover:border-primary-300 transition-colors cursor-pointer">
              <Paperclip size={18} className="mx-auto mb-2 text-text-light" />
              <span>Click to attach files</span>
              <p className="text-xs text-text-light mt-1">Upload feature coming soon</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>
              <Send size={15} /> Submit Query
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/tickets')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitTicketPage
