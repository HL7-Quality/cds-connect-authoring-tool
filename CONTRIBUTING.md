# Contributing
We welcome all friendly contributions, and use GitHub issues to track bug reports, comments, suggestions, questions, and feature requests.

Before submitting a new issue, please check to make sure a similar issue isn't already open. If one is, contribute to that issue thread with your feedback.

When submitting a bug report, please try to provide as much detail as possible, such as:

- steps to reproduce the problem
- screenshots demonstrating the problem
- the full text of error messages
- relevant outputs
- any other information you deem relevant

Please note that the GitHub issue tracker is _public_; any issues you submit are immediately visible to everyone.  For this reason, do _not_ submit any information that may be considered sensitive.

## Code Contributions

If you are planning to work on a reported bug, suggestion, or feature request, please comment on the relevant issue to indicate your intent to work on it.  If there is no associated issue, please submit a new issue describing the feature you plan to implement or the bug you plan to fix.  This reduces the likelihood of duplicated effort and also provides the maintainers an opportunity to ask questions, provide hints, or indicate any concerns _before_ you invest your time.

### Coding Practices

Code that is contributed to this project should follow these practices:

- Make changes in a personal [fork](https://help.github.com/articles/fork-a-repo/) of this repository
- Use descriptive commit messages, referencing relevant issues as appropriate (e.g., "Fixes #555: Update component to...")
- Follow the styles and conventions as enforced by the lint configurations and as evidenced by the existing code
- Prefer self-explanatory code as much as possible, but provide helpful comments for complex expressions and code blocks
- Ensure any user-facing components are accessible (i.e., compliant with [Section 508](https://www.section508.gov/))
- Include unit tests for any new or changed functionality
- Update documentation to reflect any user-facing changes

### Before Submitting a Pull Request

Before submitting a Pull Request for a code contribution:

- [Rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) on master if your code is out of synch with master
- Build the code (if applicable) and ensure there are no new warnings or errors
- Run the tests and ensure that all tests pass
- Run the linter and ensure that there are no linter warnings or errors

For details on how to build, test, and lint, see the individual project README files.

### Submitting a Pull Request

Pull requests should include a summary of the work, as well as any specific guidance regarding how to test or invoke the code.

## Apache 2.0

All contributions to this project will be released under the [Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0). By submitting a pull request, you are agreeing to comply with this license.  As indicated by the license, you are also attesting that you are the copyright owner, or an individual or Legal Entity authorized to submit the contribution on behalf of the copyright owner.
