/**
 * Passport Data Extraction Utility
 * Extracts information from passport images using OCR and MRZ parsing
 */

export interface ExtractedPassportData {
  passportNumber?: string
  surname?: string
  givenNames?: string
  dateOfBirth?: string // Format: YYYY-MM-DD
  expiryDate?: string // Format: YYYY-MM-DD
  nationality?: string
  issuingCountry?: string
  gender?: 'male' | 'female' | 'other'
  confidence?: number
}

/**
 * Parse Machine Readable Zone (MRZ) from passport
 * MRZ format: P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<
 *            L898902C36UTO7408122F1204159ZE184226B<<<<<6
 */
function parseMRZ(mrzLines: string[]): Partial<ExtractedPassportData> {
  const data: Partial<ExtractedPassportData> = {}
  
  if (mrzLines.length < 2) return data
  
  // Line 1: Contains name information
  const line1 = mrzLines[0]
  // Line 2: Contains passport number, dates, etc.
  const line2 = mrzLines[1]
  
  // Extract passport number (first 9 characters after document type)
  if (line2 && line2.length > 9) {
    const passportNum = line2.substring(0, 9).replace(/[<O0]/g, '').trim()
    if (passportNum.length >= 6) {
      data.passportNumber = passportNum
    }
  }
  
  // Extract date of birth (YYMMDD format, position 13-18 in line 2)
  if (line2 && line2.length > 18) {
    const dobStr = line2.substring(13, 19)
    if (dobStr.match(/^\d{6}$/)) {
      const year = parseInt(dobStr.substring(0, 2))
      const month = parseInt(dobStr.substring(2, 4))
      const day = parseInt(dobStr.substring(4, 6))
      // Determine century (assume 1900-2099)
      const fullYear = year < 50 ? 2000 + year : 1900 + year
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        data.dateOfBirth = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  
  // Extract gender (position 20 in line 2)
  if (line2 && line2.length > 20) {
    const genderChar = line2[20]
    if (genderChar === 'M' || genderChar === 'm') {
      data.gender = 'male'
    } else if (genderChar === 'F' || genderChar === 'f') {
      data.gender = 'female'
    }
  }
  
  // Extract expiry date (YYMMDD format, position 21-26 in line 2)
  if (line2 && line2.length > 26) {
    const expiryStr = line2.substring(21, 27)
    if (expiryStr.match(/^\d{6}$/)) {
      const year = parseInt(expiryStr.substring(0, 2))
      const month = parseInt(expiryStr.substring(2, 4))
      const day = parseInt(expiryStr.substring(4, 6))
      const fullYear = year < 50 ? 2000 + year : 1900 + year
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        data.expiryDate = `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  
  // Extract nationality (3 characters, position 10-12 in line 2)
  if (line2 && line2.length > 12) {
    const nationality = line2.substring(10, 13).replace(/</g, '').trim()
    if (nationality.length === 3) {
      data.nationality = nationality
    }
  }
  
  // Extract issuing country (first 3 characters of line 2, or from document type)
  if (line1 && line1.length > 2) {
    const docType = line1[0]
    if (docType === 'P' || docType === 'p') {
      // Passport - issuing country is usually in line 1 or can be inferred
      // For now, we'll try to extract from line 2 position 2-4
      if (line2 && line2.length > 4) {
        const issuingCountry = line2.substring(2, 5).replace(/</g, '').trim()
        if (issuingCountry.length === 3) {
          data.issuingCountry = issuingCountry
        }
      }
    }
  }
  
  // Extract name from line 1
  if (line1 && line1.length > 5) {
    // Format: P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<
    const namePart = line1.substring(5).replace(/</g, ' ').trim()
    const nameParts = namePart.split(/\s+/).filter(p => p.length > 0)
    if (nameParts.length > 0) {
      data.surname = nameParts[0]
      if (nameParts.length > 1) {
        data.givenNames = nameParts.slice(1).join(' ')
      }
    }
  }
  
  return data
}

/**
 * Extract passport data from image using OCR
 */
export async function extractPassportData(imageFile: File): Promise<ExtractedPassportData> {
  try {
    // Dynamically import Tesseract to avoid SSR issues
    const Tesseract = (await import('tesseract.js')).default
    
    // Create worker
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })
    
    // Perform OCR
    const { data: { text, confidence } } = await worker.recognize(imageFile)
    
    // Clean up worker
    await worker.terminate()
    
    // Extract MRZ lines (usually last 2-3 lines of passport)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    
    // Look for MRZ pattern (lines with < characters and specific length)
    const mrzLines = lines.filter(line => {
      // MRZ lines are typically 30-44 characters and contain < characters
      return line.length >= 30 && line.length <= 44 && line.includes('<')
    })
    
    // If we found MRZ lines, parse them
    if (mrzLines.length >= 2) {
      const extracted = parseMRZ(mrzLines.slice(-2)) // Take last 2 lines (standard MRZ format)
      extracted.confidence = confidence
      return extracted as ExtractedPassportData
    }
    
    // Fallback: Try to extract data from full text using patterns
    const extracted: ExtractedPassportData = { confidence }
    
    // Extract passport number (common patterns)
    const passportNumMatch = text.match(/(?:passport|pass|no|number)[\s:]*([A-Z0-9]{6,12})/i)
    if (passportNumMatch) {
      extracted.passportNumber = passportNumMatch[1].toUpperCase()
    }
    
    // Extract dates (DD/MM/YYYY or YYYY-MM-DD formats)
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g
    const dates: string[] = []
    let match
    while ((match = datePattern.exec(text)) !== null) {
      const day = parseInt(match[1])
      const month = parseInt(match[2])
      const year = parseInt(match[3])
      const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        dates.push(`${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
      }
    }
    
    // Try to identify date of birth and expiry
    if (dates.length >= 1) {
      // Usually first date is DOB, last is expiry
      extracted.dateOfBirth = dates[0]
      if (dates.length > 1) {
        extracted.expiryDate = dates[dates.length - 1]
      }
    }
    
    // Extract names (look for patterns like "Surname, Given Names" or "Given Names Surname")
    const namePattern = /(?:name|nom)[\s:]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    const nameMatch = text.match(namePattern)
    if (nameMatch) {
      const nameParts = nameMatch[1].split(/\s+/)
      if (nameParts.length > 1) {
        extracted.surname = nameParts[nameParts.length - 1]
        extracted.givenNames = nameParts.slice(0, -1).join(' ')
      } else {
        extracted.givenNames = nameParts[0]
      }
    }
    
    // Extract nationality/country codes
    const countryCodePattern = /(?:nationality|country)[\s:]*([A-Z]{3})/i
    const countryMatch = text.match(countryCodePattern)
    if (countryMatch) {
      extracted.nationality = countryMatch[1].toUpperCase()
    }
    
    return extracted
  } catch (error) {
    console.error('Error extracting passport data:', error)
    return { confidence: 0 }
  }
}

/**
 * Map country codes to full country names
 */
export function mapCountryCode(code: string): string | undefined {
  const countryCodeMap: Record<string, string> = {
    'USA': 'US', 'GBR': 'GB', 'CAN': 'CA', 'AUS': 'AU', 'DEU': 'DE',
    'FRA': 'FR', 'ITA': 'IT', 'ESP': 'ES', 'NLD': 'NL', 'BEL': 'BE',
    'SWE': 'SE', 'NOR': 'NO', 'DNK': 'DK', 'FIN': 'FI', 'POL': 'PL',
    'CZE': 'CZ', 'HUN': 'HU', 'ROU': 'RO', 'GRC': 'GR', 'PRT': 'PT',
    'IRL': 'IE', 'AUT': 'AT', 'CHE': 'CH', 'LUX': 'LU', 'ISL': 'IS',
    'ZAF': 'ZA', 'NGA': 'NG', 'KEN': 'KE', 'GHA': 'GH', 'TZA': 'TZ',
    'UGA': 'UG', 'ZWE': 'ZW', 'ZMB': 'ZM', 'MWI': 'MW', 'MOZ': 'MZ',
    'BWA': 'BW', 'NAM': 'NA', 'AGO': 'AO', 'IND': 'IN', 'CHN': 'CN',
    'JPN': 'JP', 'KOR': 'KR', 'SGP': 'SG', 'MYS': 'MY', 'THA': 'TH',
    'IDN': 'ID', 'PHL': 'PH', 'VNM': 'VN', 'BRA': 'BR', 'ARG': 'AR',
    'MEX': 'MX', 'CHL': 'CL', 'COL': 'CO', 'PER': 'PE', 'ECU': 'EC',
  }
  
  return countryCodeMap[code.toUpperCase()] || code
}

