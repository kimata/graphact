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

function GraphActState() {
    this.clearSelection();
}

GraphActState.prototype.clearSelection = function() {
    this.selNode = null;
    this.selNodeStroke = null;
    this.selChildNodeList = [];
    this.selChildEdgeList = [];
};

function GraphActConfig(color, order, level) {
    this.color = color;
    this.order = order;
    this.level = level;
}

GraphActConfig.prototype.getColor = function(type, parts, mode, order) {
    if (mode == 'normal') {
        return this.color[mode][type][parts];
    } else {
        return this.color[order][type][mode][parts];
    }
};

GraphActConfig.prototype.getOrderStr = function() {
    return this.order ? 'forward' : 'reverse';
};

function GraphAct(config) {
    this.state = new GraphActState();
    this.conf = new GraphActConfig(config['color'], config['order'], config['level']);
}

GraphAct.prototype.setNodeColor = function(node, mode) {
    var self = this;
    order = self.conf.getOrderStr();
    node.children('ellipse').attr({
	    stroke: self.conf.getColor('node', 'stroke', mode, order),
	    fill  : self.conf.getColor('node', 'fill', mode, order)
    });
};

GraphAct.prototype.setEdgeColor = function(edge, mode) {
    var self = this;
    order = self.conf.getOrderStr();
    edge.children('path').attr({
	    stroke: self.conf.getColor('edge', 'stroke', mode, order),
    });
    edge.children('polygon').attr({
	    stroke: self.conf.getColor('edge', 'stroke', mode, order),
	    fill  : self.conf.getColor('edge', 'stroke', mode, order)
    });
};

GraphAct.prototype.clearSelection = function() {
    var self = this;

    if (self.state.selNode == null) {
        return;
    }

    self.setNodeColor(self.state.selNode, 'normal');
    self.state.selNode.children('ellipse').attr({
	    'stroke-width': self.state.selNodeStroke
    });

    $.each(self.state.selChildNodeList, function(i, node) {
        self.setNodeColor(node, 'normal');
    });
    $.each(self.state.selChildEdgeList, function(i, node) {
	    self.setEdgeColor(node, 'normal');
    });
    self.state.clearSelection();
}

GraphAct.prototype.coloringNodeImpl = function(node, done_node_hash, remain_level) {
    var self = this;
    if (remain_level < 1) return;

    var title = node.children('title');
    var nodeName = node.children('title').text();
    var nodeNameForRegex = nodeName.replace(/([\\*+.?{}()[\]^$|\/-])/g, "\\$1");
    var edgePattern;
    var regex;
    if (self.conf.order) {
        edgePattern = nodeName + '->';
        regex = new RegExp('^' + nodeNameForRegex + '->' + '(.+)$');
    } else {
        edgePattern = '->' + nodeName;
        regex = new RegExp('^(.+)->' + nodeNameForRegex + '$');
    }

    var childNodelist = [];
    // NOTE: 高速化のため，filter をかける前に contains で限定する
    var childEdge = $('.edge title:contains("' + edgePattern + '")').filter(function(){
        if (!$(this).text().match(regex)) {
            return false;
        }
        var childNodeName = RegExp.$1;
        var childNodeTitle =$('.node title:contains("' + childNodeName + '")').filter(function() {
            return $(this).text() === childNodeName;
        });
        var childNode = childNodeTitle.parent();

        // NOTE: 高速化のため，同じノードを複数回処理するのを回避
        if (childNodeTitle.text() in done_node_hash) {
            return true;
        }
        done_node_hash[childNodeTitle.text()] = 1;
        
        self.setNodeColor(childNode, 'selected');
        childNodelist.push(childNode);
        return true;
    }).parent();

    self.setEdgeColor(childEdge, 'selected');

    Array.prototype.push.apply(self.state.selChildNodeList, childNodelist);
    self.state.selChildEdgeList.push(childEdge);

    $.each(childNodelist, function(index, value) {
        self.coloringNodeImpl(value, done_node_hash, remain_level-1);
    }) ;
};

GraphAct.prototype.coloringNode = function(node) {
    var self = this;

    self.clearSelection();
    self.state.selNode = node;
    self.setNodeColor(node, 'selected');

    self.state.selNodeStroke = node.css('stroke-width'); 
    node.children('ellipse').attr({
	    'stroke-width': self.state.selNodeStroke * 2
    });

    self.coloringNodeImpl(node, {}, self.conf.level);
};

GraphAct.prototype.updateColoring = function() {
    var self = this;
    self.coloringNode(self.state.selNode);
};

GraphAct.prototype.isSelectedNode = function(node) {
    var self = this;
    if (self.state.selNode == null) {
        return false;
    }
    var nodeTitle = node.children('title').text()
    if (nodeTitle == self.state.selNode.children('title').text()) {
        return true;
    }

    var isExist = false;
    $.each(self.state.selChildNodeList, function(index, value) {
        var childText = value.children('title').text();
        if (nodeTitle == value.children('title').text()) {
            isExist = true;
            return false; // MEMO: break
        }
    });
    return isExist;
};

function setEventHandler(graphact) {
    $('#showReverse').change(function(){
        graphact.conf.order = !$(this).is(':checked');
        $('#showReverseLabel').css({ 'font-weight': graphact.conf.order ? 'bold' : 'normal' });
        graphact.updateColoring();
    });
    $('#traceLevel').change(function(){
        graphact.conf.level = parseInt($("#traceLevel").val());
        graphact.updateColoring();
    });
    $('.node').dblclick(function() {
        graphact.coloringNode($(this));
    });
    $('.node').mouseenter(function() {
        if (graphact.isSelectedNode($(this))) {
            return;
        }
        graphact.setNodeColor($(this), 'mouseover');
    });
    $('.node').mouseleave(function() {
        if (graphact.isSelectedNode($(this))) {
            return;
        }
        graphact.setNodeColor($(this), 'normal');
    });
}

function init() {
    panZoom = new window.svgPanZoom('#graph', {
        zoomScaleSensitivity: 0.02,
        dblClickZoomEnabled: false,
        minZoom: 0.2,
        maxZoom: 8,
        zoomEnabled: true,
        controlIconsEnabled: true
    });

    graphact = new GraphAct({
        color: GRAPHACT_COLORS,
        order: !$('#showReverse').is(':checked'),
        level: parseInt($("#traceLevel").val())
    });
    setEventHandler(graphact);
}

$(document).ready(function() {
    init();
});



// Local Variables:
// coding: utf-8
// mode: javascript
// tab-width: 4
// indent-tabs-mode: nil
// End:
