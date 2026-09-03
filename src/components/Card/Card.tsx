import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import styles from './Card.module.css'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.header, className)} {...rest} />
  },
)

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return <h3 ref={ref} className={cn(styles.title, className)} {...rest} />
  },
)

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cn(styles.description, className)} {...rest} />
  },
)

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.content, className)} {...rest} />
  },
)

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.footer, className)} {...rest} />
  },
)

export const Card = Object.assign(
  forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Card({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.card, className)} {...rest} />
  }),
  {
    Header: CardHeader,
    Title: CardTitle,
    Description: CardDescription,
    Content: CardContent,
    Footer: CardFooter,
  },
)
