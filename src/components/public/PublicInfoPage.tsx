import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/layout/PublicNav";

type Section = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
};

export function PublicInfoPage({
  eyebrow,
  title,
  description,
  sections,
}: Props) {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <PublicNav />

      <main>
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:py-20">
            <Link
              href="/"
              className="text-xs font-bold text-primary hover:underline"
            >
              ← Kembali ke Beranda
            </Link>

            <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>

            <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary sm:text-base">
              {description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-5 px-4 py-10 sm:py-14">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <h2 className="font-display text-lg font-extrabold">
                {section.title}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-7 text-text-secondary"
                >
                  {paragraph}
                </p>
              ))}

              {section.items && section.items.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-6 text-text-secondary"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}