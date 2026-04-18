import type { PropsWithChildren, ReactNode } from 'react';

type CardSpotlightProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}>;

export function CardSpotlight({
  title,
  subtitle,
  action,
  className,
  children,
}: CardSpotlightProps) {
  return (
    <section className={`card-spotlight ${className ?? ''}`.trim()}>
      <header className="card-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      {children}
    </section>
  );
}
