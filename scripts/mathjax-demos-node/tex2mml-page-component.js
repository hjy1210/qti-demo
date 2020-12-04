#! /usr/bin/env -S node -r esm

/*************************************************************************
 *
 *  component/tex2mml-page in MathJAx-Demos-Node
 *
 *  Uses MathJax v3 to convert all TeX in an HTML document to MathML.
 *
 * ----------------------------------------------------------------------
 *
 *  Copyright (c) 2020 The MathJax Consortium
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

//
//  The default TeX packages to use
//
const PACKAGES = 'base, autoload, ams, newcommand, require, configmacros';

//
//  A renderAction to take the place of typesetting.
//  It renders the output to MathML instead.
//
function actionMML(math, doc) {
	const adaptor = doc.adaptor;
	const mml = MathJax.startup.toMML(math.root);
	math.typesetRoot = adaptor.firstChild(adaptor.body(adaptor.parse(mml, 'text/html')));
}

module.exports = async function toMML(htmlfile) {
	//
	//  Configure MathJax
	//
	MathJax = {
		loader: {
			paths: { mathjax: 'mathjax-full/es5' },
			source: {}, // (argv.dist ? {} : require('mathjax-full/components/src/source.js').source),
			require: require,
			load: [ 'input/tex-full', 'adaptors/liteDOM' ]
		},
		options: {
			renderActions: {
				typeset: [
					150,
					(doc) => {
						for (const math of doc.math) actionMML(math, doc);
					},
					actionMML
				]
			}
		},
		tex: {
            packages: PACKAGES.split(/\s*,\s*/), // argv.packages.replace('\*', PACKAGES).split(/\s*,\s*/)
            macros: {
                ceec: ["{\\fbox{#1}}", 1],
                bold: ["{\\bf #1}", 1]
            }
        },
		'adaptors/liteDOM': {
			fontSize: 16
		},
		startup: {
			document: htmlfile
		}
	};
	//
	//  Load the MathJax startup module
	//
	require('mathjax-full/' + 'es5/startup.js'); //(argv.dist ? 'es5' : 'components/src/startup') + '/startup.js');

	//
	//  Wait for MathJax to start up, and then render the math.
	//  Then output the resulting HTML file.
	//
	let res = '';
	try {
		await MathJax.startup.promise;
		const adaptor = MathJax.startup.adaptor;
		const html = MathJax.startup.document;
		html.render();
		res += adaptor.doctype(html.document); // console.log(adaptor.doctype(html.document));
		res += adaptor.outerHTML(adaptor.root(html.document)); // console.log(adaptor.outerHTML(adaptor.root(html.document)));
		return res;
	} catch (err) {
		res += err; // console.log(err)
		return res;
	}
}
// module.exports = { toMML };
