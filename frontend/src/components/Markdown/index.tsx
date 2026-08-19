import type React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
    text: string;
}

function Code({
    className: _className,
    children,
    ...props
}: React.ComponentPropsWithoutRef<"code">) {
    // Example: differentiate inline code vs code block
    return (
        <code
            {...props}
            style={{
                backgroundColor: "#f5f5f5",
                color: "#d32f2f",
                padding: "2px 4px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "0.9em",
            }}
        >
            {children}
        </code>
    );
}

function Link(props: React.ComponentPropsWithoutRef<"a">) {
    return (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
        />
    );
}

const MarkdownComponent = ({ text = "" }: MarkdownProps) => {
    return (
        <ReactMarkdown
            components={{
                a: Link,
                code: Code,
            }}
        >
            {text}
        </ReactMarkdown>
    );
};

export default MarkdownComponent;
