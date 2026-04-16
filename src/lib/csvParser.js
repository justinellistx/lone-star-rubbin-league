/**
 * iRacing CSV parser for race result exports
 */

/**
 * Parse raw iRacing CSV format
 * iRacing CSV structure:
 * - Rows 1-2: Metadata (Start Time, Track, Series, etc)
 * - Rows 5-6: League info
 * - Row 7: Blank
 * - Row 8: Headers
 * - Row 9+: Data rows
 *
 * @param {string} csvText - Raw CSV text
 * @returns {Object} { metadata, results }
 */
export function parseIRacingCSV(csvText) {
  const lines = csvText.split('\n').map((line) => line.trim());

  // Extract metadata from top rows
  const metadata = {};
  const results = [];

  let headerRowIndex = -1;
  const headers = [];

  // Parse metadata rows (rows 0-6, looking for key=value pairs)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line) continue;

    // Check if this is a header row (contains "Fin Pos" or similar column names)
    if (
      line.includes('Fin Pos') ||
      line.includes('Car ID') ||
      line.includes('Name')
    ) {
      headerRowIndex = i;
      // Parse headers
      const headerLine = parseCSVLine(line);
      headers.push(
        ...headerLine.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
      );
      break;
    }

    // Parse metadata key=value pairs
    const parts = line.split(',');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(',').trim();

      if (key.includes('Start Time')) {
        metadata.startTime = value;
      } else if (key.includes('Track')) {
        metadata.track = value;
      } else if (key.includes('Series')) {
        metadata.series = value;
      } else if (key.includes('Session Name')) {
        metadata.sessionName = value;
      } else if (key.includes('League Name')) {
        metadata.leagueName = value;
      } else if (key.includes('League ID')) {
        metadata.leagueId = value;
      } else if (key.includes('League Season')) {
        metadata.leagueSeason = value;
      } else if (key.includes('League Season ID')) {
        metadata.leagueSeasonId = value;
      } else if (key.includes('Points System')) {
        metadata.pointsSystem = value;
      }
    }
  }

  // Parse data rows
  if (headerRowIndex >= 0) {
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const values = parseCSVLine(line);
      if (values.length < headers.length) continue;

      const result = {};

      // Map values to headers
      headers.forEach((header, index) => {
        let value = values[index]?.trim() || '';

        // Convert to appropriate types
        if (
          [
            'fin_pos',
            'start_pos',
            'car_id',
            'car_class_id',
            'team_id',
            'cust_id',
            'car_number',
            'out_id',
            'laps_led',
            'fast_lap#',
            'laps_comp',
            'inc',
          ].includes(header)
        ) {
          value = parseInt(value, 10) || 0;
        } else if (
          [
            'qualify_time',
            'average_lap_time',
            'fastest_lap_time',
            'interval',
          ].includes(header)
        ) {
          value = value ? parseFloat(value) : null;
        }

        // Map to normalized keys
        const normalizedKey = normalizeHeader(header);
        result[normalizedKey] = value;
      });

      // Only add if we have at least a name and position
      if (result.name || result.finPos) {
        results.push(result);
      }
    }
  }

  return {
    metadata,
    results,
  };
}

/**
 * Normalize iRacing CSV headers to our internal format
 * @param {string} header - Raw header name
 * @returns {string} Normalized header key
 */
function normalizeHeader(header) {
  const mappings = {
    fin_pos: 'finPos',
    car_id: 'carId',
    car: 'car',
    car_class_id: 'carClassId',
    car_class: 'carClass',
    team_id: 'teamId',
    cust_id: 'custId',
    name: 'name',
    start_pos: 'startPos',
    car_number: 'carNumber',
    out_id: 'outId',
    out: 'outReason',
    interval: 'interval',
    laps_led: 'lapsLed',
    qualify_time: 'qualifyTime',
    average_lap_time: 'avgLapTime',
    fastest_lap_time: 'fastestLapTime',
    fast_lap: 'fastestLapNumber',
    'fast_lap#': 'fastestLapNumber',
    laps_comp: 'lapsCompleted',
    inc: 'incidents',
  };

  return mappings[header] || header;
}

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array} Parsed values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    result.push(current);
  }

  return result;
}

/**
 * Transform parsed race data into rows ready for Supabase insert
 * @param {Object} parsed - Result from parseIRacingCSV
 * @param {string} raceId - UUID of the race
 * @param {Object} driverMap - Map of custId -> driver UUID
 * @returns {Array} Array of race_results rows ready for insert
 */
export function processRaceForUpload(parsed, raceId, driverMap) {
  if (!parsed.results) {
    return [];
  }

  return parsed.results
    .map((result) => {
      const driverId = driverMap[result.custId];

      if (!driverId) {
        console.warn(`Driver not found for custId: ${result.custId}`);
        return null;
      }

      return {
        race_id: raceId,
        driver_id: driverId,
        finish_position: result.finPos || null,
        start_position: result.startPos || null,
        car_name: result.car || result.carClass || null,
        car_number: result.carNumber || null,
        car_id: result.carId || null,
        laps_completed: result.lapsCompleted || 0,
        laps_led: result.lapsLed || 0,
        incidents: result.incidents || 0,
        out_reason: result.outReason || 'Running',
        qualify_time: result.qualifyTime || null,
        average_lap_time: result.avgLapTime || null,
        fastest_lap_time: result.fastestLapTime || null,
        fastest_lap_number: result.fastestLapNumber || null,
        interval: result.interval || null,
        iracing_cust_id: result.custId || null,
      };
    })
    .filter((row) => row !== null);
}
