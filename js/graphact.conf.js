///////////////////////////////////////////////////////////////////////////////
// Copyright (C) 2014 Tetsuya Kimata <kimata@green-rabbit.net>
//
// All rights reserved.
//
// This software is provided 'as-is', without any express or implied
// warranty.  In no event will the authors be held liable for any
// damages arising from the use of this software.
//
// Permission is granted to anyone to use this software for any
// purpose, including commercial applications, and to alter it and
// redistribute it freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must
//    not claim that you wrote the original software. If you use this
//    software in a product, an acknowledgment in the product
//    documentation would be appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must
//    not be misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source
//    distribution.
//
///////////////////////////////////////////////////////////////////////////////

var GRAPHACT_COLORS = {
    // デフォルト状態
    normal: {
	    node: {
	        stroke: 'black',
	        fill: 'none'
	    },
	    edge: {
	        stroke: 'black'
	    }
    },
    // 正順で辿る場合
    forward: {
	    node: {
	        selected: {
		        stroke: 'green',
		        fill: '#C1FFBD'
	        },
	        mouseover: {
		        stroke: 'green',
		        fill: 'none'
	        }
	    },
	    edge: {
	        selected: {
		        stroke: 'green'
	        }
	    }
    },
    // 逆順で辿る場合
    reverse: {
	    node: {
	        selected: {
		        stroke: 'red' ,
		        fill: '#FFD1D3'
	        },
	        mouseover: {
		        stroke: 'red',
		        fill: 'none'
	        }
	    },
	    edge: {
	        selected: {
		        stroke: 'red'
	        }
	    },
    }
};

// Local Variables:
// coding: utf-8
// mode: javascript
// tab-width: 4
// indent-tabs-mode: nil
// End:
