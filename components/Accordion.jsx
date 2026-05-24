"use client";

import { useState, useRef, useEffect } from 'react';

function AccordionItem({ question, answer, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className={`accordion-item${isOpen ? ' open' : ''}`}>
      <button
        className="accordion-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="accordion-question">{question}</span>
        <span className="accordion-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className="accordion-content"
        style={{ height: `${height}px` }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="accordion-body">
          {answer}
        </div>
      </div>
    </div>
  );
}

export function AccordionGroup({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="accordion-group">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => toggle(i)}
        />
      ))}
    </div>
  );
}
