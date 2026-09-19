import type { CSSProperties } from "react";
import { buildCalendar, type CalendarSlot } from "../lib/calendar";
import { buildTokens } from "../lib/tokens";
import type {
  Sprint,
  SprintDay,
  SprintException,
  SprintPriority,
  SprintRisk,
} from "../lib/types";

/**
 * A folha do sprint.
 *
 * Componente de apresentação puro: recebe um sprint **já validado** e o desenha.
 * Não decide geometria (isso é do `print.css`), não corta texto, não ajusta
 * tamanho. O mesmo componente serve o preview e o PDF, que é o que impede os
 * dois de divergirem.
 */

interface SprintSheetProps {
  sprint: Sprint;
}

/** Junta `ref` e `refs` numa lista única — o fixture usa as duas formas. */
function collectRefs(item: SprintPriority | SprintRisk | SprintException): string[] {
  const refs: string[] = [];
  if ("ref" in item && item.ref) refs.push(item.ref);
  if ("refs" in item && item.refs) refs.push(...item.refs);
  return refs;
}

function DayColumn({ slot }: { slot: CalendarSlot }) {
  if (!slot.day) {
    // Coluna de calendário sem execução programada. Fica em branco de
    // propósito: inventar conteúdo aqui violaria `no_inference`.
    return (
      <section className="day day--empty" data-slot={slot.weekday} data-filled="false">
        <h2 className="day__name">{slot.weekday}</h2>
        <div className="day__blank" aria-hidden="true" />
      </section>
    );
  }

  const day: SprintDay = slot.day;

  return (
    <section className="day" data-slot={slot.weekday} data-filled="true">
      <h2 className="day__name">{day.day}</h2>

      <p className="day__objective">{day.objective}</p>

      <p className="section-label">Ações</p>
      <ol className="actions">
        {/*
          Índice, texto e referência correm no MESMO fluxo de linha. Uma coluna
          de 34,7mm comporta ~19 caracteres a 10pt; reservar uma coluna de grade
          para o índice consumia 14% dessa largura em todas as linhas, e a
          referência em linha própria custava mais 10pt por ação.
        */}
        {day.actions.map((action) => (
          <li className="action" key={`${action.index}-${action.ref}`}>
            <span className="action__index">{action.index}</span> {action.text}{" "}
            <span className="action__ref">{action.ref}</span>
          </li>
        ))}
      </ol>

      <p className="section-label">Entregas</p>
      <ul className="deliverables">
        {day.deliverables.map((deliverable) => (
          <li className="deliverable" key={deliverable.text}>
            {deliverable.text}
          </li>
        ))}
      </ul>

      {day.note ? <p className="day__note">{day.note}</p> : null}
    </section>
  );
}

export function SprintSheet({ sprint }: SprintSheetProps) {
  const tokens = buildTokens();
  const calendar = buildCalendar(sprint.days);
  const { review, next_week: nextWeek, compliance } = sprint;

  return (
    <article className="sheet" style={tokens.css as CSSProperties} data-sprint={sprint.id}>
      <header className="header">
        <h1 className="header__title">{sprint.title}</h1>
        <div className="header__meta">
          <span>{sprint.period}</span>
          <span>{sprint.id}</span>
        </div>
      </header>

      <div className="weekgoal">
        <span className="weekgoal__label">Meta da semana</span>
        <p className="weekgoal__text">{sprint.week_goal}</p>
      </div>

      {/*
        As exceções de compliance ficam numa tira de largura total logo abaixo
        da meta. No rodapé elas quebravam em várias linhas dentro de uma coluna
        estreita; aqui cabem em uma só. Não são "próxima semana" — são
        pendências declaradas da semana corrente, e ficam à vista.
      */}
      {compliance?.exceptions?.length ? (
        <p className="exceptions">
          <span className="exceptions__label">Pendências</span>
          {compliance.exceptions.map((exception, index) => (
            <span className="exception" key={exception.id}>
              {index > 0 ? <span className="exception__sep"> · </span> : null}
              <span className="exception__id">{exception.id}</span>
              {exception.text}
            </span>
          ))}
        </p>
      ) : null}

      <div className="days">
        {calendar.map((slot) => (
          <DayColumn slot={slot} key={slot.weekday} />
        ))}
      </div>

      <footer className="footer">
        <div className="footer__block" data-block="review">
          {/* A data entra no rótulo em vez de ocupar uma linha própria: no
              rodapé, cada linha custa ~20pt de altura da folha. */}
          <p className="section-label">
            Fechamento
            {review.scheduled_for
              ? ` · ${review.mode === "closed" ? "encerrado" : "previsto"} ${review.scheduled_for}`
              : ""}
          </p>
          {review.progress ? (
            <p className="footer__row">
              <span className="footer__term">Avanço</span>
              {review.progress}
            </p>
          ) : null}
          {review.carryover ? (
            <p className="footer__row">
              <span className="footer__term">Pendente</span>
              {review.carryover}
            </p>
          ) : null}
        </div>

        <div className="footer__block" data-block="next-week">
          <p className="section-label">
            Próxima semana{nextWeek.label ? ` · ${nextWeek.label}` : ""}
          </p>
          <ol className="priorities" data-count={nextWeek.priorities.length}>
            {nextWeek.priorities.map((priority) => (
              <li className="priority" key={priority.text}>
                {priority.text}{" "}
                {collectRefs(priority).length > 0 ? (
                  <span className="priority__ref">{collectRefs(priority).join(" · ")}</span>
                ) : null}
              </li>
            ))}
          </ol>

        </div>

        <div className="footer__block" data-block="risks">
          {nextWeek.risks?.length ? (
            <>
              <p className="section-label">Riscos</p>
              <ul className="risks">
                {nextWeek.risks.map((risk) => (
                  <li className="risk" key={risk.text}>
                    {risk.text}{" "}
                    {collectRefs(risk).length > 0 ? (
                      <span className="risk__ref">
                        {collectRefs(risk).join(" · ")}
                        {risk.evidence ? ` — ${risk.evidence}` : ""}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
