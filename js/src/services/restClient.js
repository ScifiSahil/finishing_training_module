/**
 * ─── REST CLIENT ─────────────────────────────────────────────────────
 * Talks to the CONTACT collection API: /api/v1/collection/<table>
 * Endpoints, headers and auth come from apiConfig.js / authService / csrfService.
 *
 *   list(endpointKey, filter)   rows of a table (follows "next" pages), filter = { column: value }
 *   create(endpointKey, values) POST a new row
 *   update(row, patch)          PATCH a row that came from list()/create()
 *
 * NOTE: filter() is done here in the browser. If your CONTACT REST supports a query filter,
 * change only _query() below.
 * ─────────────────────────────────────────────────────────────────────
 */

import { API_URLS, JSON_HEADERS, REQUIRES_AUTH } from "./apiConfig";
import csrfService from "./csrfService";

const MAX_PAGES = 200;

class RestClient {
  async _headers(method) {
    const headers = { ...JSON_HEADERS };
    if (method !== "GET" && REQUIRES_AUTH) {
      const token = await csrfService.getCsrfToken();
      if (token) {
        // CONTACT versions differ in the header name, so both spellings are sent
        headers["X-CSRFToken"] = token;
        headers["X-CSRF-Token"] = token;
      }
    }
    return headers;
  }

  async _request(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: await this._headers(method),
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }
    if (!res.ok) {
      const detail = this._describe(data) || text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200);
      const err = new Error(`${method} ${this._shortUrl(url)}: error ${res.status}${detail ? ` (${detail})` : ""}`);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  // Readable text from a server error answer, whatever shape it has ({ message }, { error: { message } }, ...)
  _describe(data, depth = 0) {
    if (data === null || data === undefined || depth > 3) return "";
    if (typeof data === "string") return data;
    if (typeof data === "number") return String(data);
    if (Array.isArray(data)) return data.map((d) => this._describe(d, depth + 1)).filter(Boolean).join("; ");
    for (const key of ["message", "detail", "error", "title", "reason", "description"]) {
      const text = this._describe(data[key], depth + 1);
      if (text) return text;
    }
    try {
      return JSON.stringify(data).slice(0, 200);
    } catch (e) {
      return "";
    }
  }

  // "/api/v1/collection/finishing_training_trainee" from a full address
  _shortUrl(url) {
    return String(url).replace(/^https?:\/\/[^/]+/, "");
  }

  // The rows inside a collection answer (supports { objects }, { results } or a plain array)
  _rows(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.objects)) return data.objects;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  }

  // Query string for a filter. Empty for now (filtering happens in the browser).
  _query() {
    return "";
  }

  // Address of a table. A missing ENDPOINTS line in apiConfig.js gives a clear message.
  _url(endpointKey) {
    const url = API_URLS[endpointKey];
    if (!url) {
      throw new Error(`"${endpointKey}" is missing in apiConfig.js ENDPOINTS. Add the training lines there.`);
    }
    return url;
  }

  async list(endpointKey, filter) {
    let url = `${this._url(endpointKey)}${this._query(filter)}`;
    let rows = [];
    for (let page = 0; url && page < MAX_PAGES; page++) {
      const data = await this._request("GET", url);
      rows = rows.concat(this._rows(data));
      url = data && typeof data.next === "string" ? data.next : null;
    }
    if (!filter) return rows;
    return rows.filter((r) => Object.keys(filter).every((k) => r[k] === filter[k]));
  }

  async first(endpointKey, filter) {
    const rows = await this.list(endpointKey, filter);
    return rows.length ? rows[0] : null;
  }

  async create(endpointKey, values) {
    const created = await this._request("POST", this._url(endpointKey), values);
    return created && typeof created === "object" ? { ...values, ...created } : { ...values };
  }

  // row = an object returned by list() or create(); its "@id" is the address of the row
  async update(row, patch) {
    const address = row["@id"];
    if (!address) throw new Error("This row has no @id, so it cannot be updated");
    const updated = await this._request("PATCH", address, patch);
    return { ...row, ...patch, ...(updated && typeof updated === "object" ? updated : {}) };
  }

  // Updates the row that matches `keys`, or creates it. Returns the saved row.
  async save(endpointKey, keys, values) {
    const existing = await this.first(endpointKey, keys);
    if (existing) return this.update(existing, values);
    return this.create(endpointKey, { ...keys, ...values });
  }
}

export default new RestClient();