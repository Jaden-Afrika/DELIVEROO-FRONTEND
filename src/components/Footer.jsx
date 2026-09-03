export default function Footer() {
  return (
    <footer className="border-t border-amber/30 bg-ink px-5 py-10 text-paper sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-xl font-bold text-amber">Deliveroo™</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-paper/70">Reliable parcel delivery for everyday routes, growing businesses, and everything in between.</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-paper/45">Move it with confidence</p>
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-amber">Services</h2>
            <ul className="mt-3 space-y-2 text-sm text-paper/75">
              <li>Same-day delivery</li>
              <li>Scheduled drop-offs</li>
              <li>Business dispatch</li>
              <li>Parcel tracking</li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-amber">Company</h2>
            <ul className="mt-3 space-y-2 text-sm text-paper/75">
              <li><a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">About Deliveroo</a></li>
              <li><a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">Partner with us</a></li>
              <li><a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">Careers</a></li>
              <li><a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">Help centre</a></li>
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs uppercase tracking-[0.16em] text-amber">Get in touch</h2>
            <div className="mt-3 space-y-2 text-sm text-paper/75">
              <a className="block transition hover:text-amber" href="tel:0712496142">0712496142</a>
              <a className="block transition hover:text-amber" href="mailto:deliveroo@gmail.com">deliveroo@gmail.com</a>
              <p className="pt-2 text-paper/50">Mon - Sat, 08:00 - 18:00</p>
              <p className="text-paper/50">Serving local routes nationwide</p>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-paper/15 pt-5 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Deliveroo™. All rights reserved.</p>
          <div className="flex gap-4">
            <a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">Privacy</a>
            <a className="transition hover:text-amber" href="mailto:deliveroo@gmail.com">Terms</a>
            <span>Built for better hand-offs.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}