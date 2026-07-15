import { TZDate } from '@date-fns/tz'
import { TuiDay } from '@taiga-ui/cdk'
import { addMonths, differenceInYears, endOfDay, format, isValid, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

class DateUtilsImpl {
  private readonly ZONA_MX = 'America/Mexico_City'

  parseDateString(dateString: string): Date | null {
    if (!dateString) return null

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
    if (match) {
      const [, year, month, day] = match.map(Number)
      return TZDate.tz(this.ZONA_MX, year, month - 1, day)
    }

    const date = TZDate.tz(this.ZONA_MX, new Date(dateString).getTime())
    if (!isValid(date)) {
      console.warn(`Fecha inválida: ${dateString}`)
      return null
    }
    return date
  }

  formatDateForAPI(date: Date | null | undefined): string | null {
    if (!date) return null

    const tzDate = new TZDate(date, this.ZONA_MX)
    if (!isValid(tzDate)) {
      console.warn('Fecha inválida para formatear:', date)
      return null
    }

    return format(tzDate, 'yyyy-MM-dd')
  }

  formatDateForDisplay(date: Date | null | undefined): string {
    if (!date) return ''

    const tzDate = new TZDate(date, this.ZONA_MX)
    if (!isValid(tzDate)) {
      console.warn('Fecha inválida para mostrar:', date)
      return ''
    }

    return format(tzDate, 'PPPP', { locale: es })
  }

  today(): Date {
    return startOfDay(TZDate.tz(this.ZONA_MX))
  }

  isValidDate(date: Date | null | undefined): boolean {
    if (!date) return false
    return isValid(date)
  }

  formatForDateInput(date: Date | null | undefined): string {
    if (!date) return ''
    return format(new TZDate(date, this.ZONA_MX), 'yyyy-MM-dd')
  }

  calculateAge(birthDate: Date | null | undefined): number | null {
    if (!birthDate) return null
    const birth = new TZDate(birthDate, this.ZONA_MX)
    const now = TZDate.tz(this.ZONA_MX)
    return differenceInYears(now, birth)
  }

  isPastDate(date: Date | null | undefined): boolean {
    if (!date) return false
    return new TZDate(date, this.ZONA_MX) < TZDate.tz(this.ZONA_MX)
  }

  calculateMembershipExpiration(startDate: Date, durationMonths: number): Date {
    const start = new TZDate(startDate, this.ZONA_MX)
    return endOfDay(addMonths(start, durationMonths))
  }

  toTuiDay(dateString: string | null | undefined): TuiDay {
    const date = this.parseDateString(dateString ?? '')
    if (!date) return TuiDay.currentLocal()
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate())
  }

  fromTuiDay(day: TuiDay): string | null {
    const date = new Date(day.year, day.month, day.day)
    return this.formatDateForAPI(date)
  }
}

export const DateUtils = new DateUtilsImpl()
