import unittest

from validate_blog_quality import readability_flesch_target, score_conversion


class ReadabilityFleschTargetTests(unittest.TestCase):
    def test_uses_a_technical_target_for_ai_domain_copy(self):
        text = 'ChatGPT and Perplexity support automation, transcription, integrations, workflows, and API configuration.'

        self.assertEqual(readability_flesch_target(text), 45)

    def test_keeps_the_plain_language_target_for_general_copy(self):
        self.assertEqual(readability_flesch_target('Use clear short words in each sentence.'), 60)

    def test_does_not_count_an_inline_link_as_a_distributed_cta(self):
        html = (
            '<a href="https://tool.example/one">Visit Tool One</a>'
            '<a href="https://tool.example/two">Visit Tool Two</a>'
            + ('x' * 500)
            + '<a href="https://tool.example/docs">Read the documentation</a>'
        )

        score, _, issues = score_conversion({}, '', html, 100)

        self.assertEqual(score, 2)
        self.assertIn('CTAs clustered in one half of the post — spread top/middle/end', issues)


if __name__ == '__main__':
    unittest.main()