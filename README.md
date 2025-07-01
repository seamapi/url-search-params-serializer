# URLSearchParams Serializer

[![npm](https://img.shields.io/npm/v/@seamapi/url-search-params-serializer.svg)](https://www.npmjs.com/package/@seamapi/url-search-params-serializer)
[![GitHub Actions](https://github.com/seamapi/url-search-params-serializer/actions/workflows/check.yml/badge.svg)](https://github.com/seamapi/url-search-params-serializer/actions/workflows/check.yml)

Serializes JavaScript objects to URLSearchParams.

## Description

Defines the standard for how the Seam SDKs and other Seam API consumers
should serialize objects to [URLSearchParams] in HTTP GET requests.
Serves as a reference implementation for Seam SDKs in other languages.

This serializer may be used as a true inverse operation to [@seamapi/url-search-params-parser][@url-search-params-parser].

[URLSearchParams]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
[@url-search-params-parser]: https://github.com/seamapi/url-search-params-parser

### Serialization strategy

Serialization uses
[`URLSearchParams.toString()`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/toString#return_value)
which encodes most non-alphanumeric characters.

- The primitive `null` is serialized to an empty value,
  e.g., `{ foo: null }` serializes to `foo=`.
- Any `undefined` values are removed,
  e.g., `{ foo: undefined, bar: 1 }` serializes to `bar=1`.
- The primitive type `string` is serialized using `.toString()`.
  - Serialization of the empty string
    is not supported and will throw an `UnserializableParamError`.
    Otherwise, the serialization of `{ foo: null }` would conflict with `{ foo: '' }`.
    This serializer chooses to support the more common and more useful case of `null`.
- The primitive `number` and `bigint` types are serialized using `.toString()`.
- The primitive `boolean` type is serialized using `.toString()`,
  e.g., `{ foo: true, bar: false }` serializes to `foo=true&bar=false`.
- `Date` objects are detected and serialized using `Date.toISOString()`,
  e.g., `{ foo: new Date(0) }` serializes to `foo=1970-01-01T00%3A00%3A00.000Z`.
- `Temporal.Instant` objects are detected and serialized by first converting them to `Date`
  and then serializing the `Date` as above.
- Arrays are serialized using
  [`URLSearchParams.append()`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append):
  - Array values are serialized as above.
  - The array `{ foo: [1, 2] }` serializes to `foo=1&foo=2`.
  - The single element array `{ foo: [1] }` serializes to `foo=1`.
  - The empty array `{ foo: [] }` serializes to `foo=`.
    As this serialization overlaps with `null`, parser implementations are advised
    not to support nullable array parameters and parse this as the empty array.
  - To support typed tuples, serialization of arrays containing mixed values is allowed.
  - Serialization of arrays containing `null` or `undefined` values
    is not supported and will throw an `UnserializableParamError`.
  - Serialization of arrays containing the empty string
    is not supported and will throw an `UnserializableParamError`.
    Otherwise, the serialization of `{ foo: [''] }` would conflict with `{ foo: [] }`.
    This serializer chooses to support the more common and more useful case of an empty array.
- Serialization of objects and nested objects first serializes the keys
  to dot-path format and then serializes the values as above, e.g.,
  `{ foo: 'a', bar: { baz: 'b', fizz: [1, 2] } }` serializes to
  `foo=a&bar.baz=b&bar.fizz=1&bar.fizz=2`.
- Serialization of keys containing a `.`
  is not supported and will throw an `UnserializableParamError`.
- Serialization of nested arrays or objects nested inside arrays
  is not supported and will throw an `UnserializableParamError`.
- Serialization of functions or other objects is
  is not supported and will throw an `UnserializableParamError`.
- Serialization of `NaN`, `Infinity`, and `-Infinity`
  is not supported and will throw an `UnserializableParamError`.

### Compatible parsing strategy

Serialization is guaranteed to be well-defined within each type, i.e.,
if the value-type for a given key in the query string is fixed and known by
the consumer parsing the string, it can be unambigously parsed back to the original primitive value:

- A parser can implement a inverse function to the serialization if it uses a schema which,
  for each node, defines a type matching exactly one of the primitive or nested types below.
- Any node may be marked optional, i.e., `undefined`, which corresponds to the absence of the key in the query string.
- The parser may choose `Temporal.Instant` as an equivalent alternative to `Date`.
- Object keys must not include a `.`.

##### Primitive

- `string | null`.
  - Excludes zero-length strings.
- `number | null`.
- `bigint | null`.
- `boolean | null`.
- `Date | null`.
- `Array<string | number | bigint | boolean | Date>`.
  - Excludes zero-length strings.
  - Arrays must use a single value-type.
  - Otherwise, the array may be a tuple which may use a different value-type per slot.

#### Nested

- `object | null`.
  - Must meet the same constraints as the top level schema.
- `Record | null`.
  - The record type must use a `string` type for the key,
    and a single primitive or single nested type for the value.

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install @seamapi/url-search-params-serializer
```

[npm]: https://www.npmjs.com/

## Usage

### Serialize an object to a string

```ts
import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'

serializeUrlSearchParams({
  name: 'Dax',
  age: 27,
  isAdmin: true,
  tags: ['cars', 'planes'],
}) // => 'age=27&isAdmin=true&name=Dax&tags=cars&tags=planes'
```

### Update an existing URLSearchParams instance

```ts
import { updateUrlSearchParams } from '@seamapi/url-search-params-serializer'

const searchParams = new URLSearchParams()

searchParams.set('foo', 'bar')

updateUrlSearchParams(searchParams, {
  name: 'Dax',
  age: 27,
  isAdmin: true,
  tags: ['cars', 'planes'],
})

searchParams.toString() // => 'age=27&foo=bar&isAdmin=true&name=Dax&tags=cars&tags=planes'
```

### Use directly with [Axios]

```ts
import axios from 'axios'
import { serializeUrlSearchParams } from '@seamapi/url-search-params-serializer'

const client = axios.create({
  paramsSerializer: serializeUrlSearchParams,
  baseURL: 'https://example.com',
})

const { data } = await client.get('/search', {
  params: {
    name: 'Dax',
    age: 27,
    isAdmin: true,
    tags: ['cars', 'planes'],
  },
})
```

[Axios]: https://axios-http.com/

## Motivation

URL search parameters are strings, however the Seam API will parse parameters as complex types.
The Seam SDK must accept the complex types as input and serialize these
to search parameters in a way supported by the Seam API.

There is no single standard for this serialization.
This module establishes the serialization standard adopted by the Seam API.

### Why not use [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)?

- Passing a raw object to URLSearchParams has unpredictable serialization behavior.

### Why not [qs](https://github.com/ljharb/qs)?

- Not a zero-dependency module. Has quite a few dependency layers.
- Impractical as a reference implementation.
  qs enables complex, non-standard parsing and serialization,
  which makes ensuing SDK parity much harder.
  Similarly, this puts an unreasonable burden on user's of the HTTP API or those implementing their own client.
- The Seam API must ensure it handles a well defined set of non-string query parameters consistency.
  Using qs would allow the SDK to send unsupported or incorrectly serialized parameter types to the API
  resulting in unexpected behavior.

### Why not use the default [Axios](https://axios-http.com/) serializer?

- Using the default [Axios] serializer was the original approach,
  however it had similar issues to using URLSearchParams and qs as noted above.

## Development and Testing

### Quickstart

```
$ git clone https://github.com/seamapi/url-search-params-serializer.git
$ cd url-search-params-serializer
$ nvm install
$ npm install
$ npm run test:watch
```

Primary development tasks are defined under `scripts` in `package.json`
and available via `npm run`.
View them with

```
$ npm run
```

### Source code

The [source code] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:seamapi/url-search-params-serializer.git
```

[source code]: https://github.com/seamapi/url-search-params-serializer

### Requirements

You will need [Node.js] with [npm] and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ npm install
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

### Publishing

#### Automatic

New versions are released automatically with [semantic-release]
as long as commits follow the [Angular Commit Message Conventions].

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format
[semantic-release]: https://semantic-release.gitbook.io/

#### Manual

Publish a new version by triggering a [version workflow_dispatch on GitHub Actions].
The `version` input will be passed as the first argument to [npm-version].

This may be done on the web or using the [GitHub CLI] with

```
$ gh workflow run version.yml --raw-field version=<version>
```

[GitHub CLI]: https://cli.github.com/
[npm-version]: https://docs.npmjs.com/cli/version
[version workflow_dispatch on GitHub Actions]: https://github.com/seamapi/url-search-params-serializer/actions?query=workflow%3Aversion

## GitHub Actions

_GitHub Actions should already be configured: this section is for reference only._

The following repository secrets must be set on [GitHub Actions]:

- `NPM_TOKEN`: npm token for installing and publishing packages.
- `GH_TOKEN`: A personal access token for the bot user with
  `packages:write` and `contents:write` permission.
- `GIT_USER_NAME`: The GitHub bot user's real name.
- `GIT_USER_EMAIL`: The GitHub bot user's email.
- `GPG_PRIVATE_KEY`: The GitHub bot user's [GPG private key].
- `GPG_PASSPHRASE`: The GitHub bot user's GPG passphrase.

[GitHub Actions]: https://github.com/features/actions
[GPG private key]: https://github.com/marketplace/actions/import-gpg#prerequisites

## Contributing

> If using squash merge, edit and ensure the commit message follows the [Angular Commit Message Conventions] specification.
> Otherwise, each individual commit must follow the [Angular Commit Message Conventions] specification.

1. Create your feature branch (`git checkout -b my-new-feature`).
2. Make changes.
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin my-new-feature`).
5. Create a new draft pull request.
6. Ensure all checks pass.
7. Mark your pull request ready for review.
8. Wait for the required approval from the code owners.
9. Merge when ready.

[Angular Commit Message Conventions]: https://semantic-release.gitbook.io/semantic-release/#commit-message-format

## License

This npm package is licensed under the MIT license.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
