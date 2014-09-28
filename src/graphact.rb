#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
###############################################################################
# Copyright (C) 2014 Tetsuya Kimata <kimata@green-rabbit.net>
#
# All rights reserved.
#
# This software is provided 'as-is', without any express or implied
# warranty.  In no event will the authors be held liable for any
# damages arising from the use of this software.
#
# Permission is granted to anyone to use this software for any
# purpose, including commercial applications, and to alter it and
# redistribute it freely, subject to the following restrictions:
#
# 1. The origin of this software must not be misrepresented; you must
#    not claim that you wrote the original software. If you use this
#    software in a product, an acknowledgment in the product
#    documentation would be appreciated but is not required.
#
# 2. Altered source versions must be plainly marked as such, and must
#    not be misrepresented as being the original software.
#
# 3. This notice may not be removed or altered from any source
#    distribution.
#
###############################################################################

require "erb"
require 'optparse'

params = {
  j: [],
  c: [],
}

def render path
  ERB.new(File.read(File.expand_path(path))).result(binding)
end

def get_svg_data path
  svg_data_lines = []
  File.open(path) {|f|
    f.each_line {|line|
      if line =~ %r|^<g id|
        svg_data_lines.push(line)
        break
      end
    }
    f.each_line {|line|
      if line =~ %r|^</svg>|
        break
      end

      next if line=~ %r|<polygon fill="white" stroke="none" points=".*"/>|
      next if line =~ %r|<title>G</title>|

      svg_data_lines.push(line)
    }
  }
  return svg_data_lines.join('')
end

opt = OptionParser.new
opt.on('-j javascript_file(s)') {|v| params[:j].push(v) }
opt.on('-c css_file(s)') {|v| params[:c].push(v) }
opt.on('-s svg_file [REQUIRED]') {|v| params[:s] = v }
opt.on('-t template_file [REQUIRED]') {|v| params[:t] = v }
opt.on('-T title') {|v| params[:T] = v }
opt.on('-o output_file') {|v| params[:o] = v }
opt.parse!(ARGV)

if (params[:t] == nil) || (params[:s] == nil) then
  puts opt.help()
  exit(-1)
end

svg_file = params[:s]
tmpl_file = params[:t]
js_file_list = params[:j]
css_file_list = params[:c]
output_file = params[:o]
if (params[:T] == nil) || (params[:T].length == 0) then
  title = File.basename(svg_file)
end 


svg_data = get_svg_data(svg_file)
erb = ERB.new(File.read(tmpl_file))

if (output_file) then
  File.write(output_file, erb.result(binding))
else
  puts erb.result(binding)
end

exit(0)

# Local Variables:
# coding: utf-8
# mode: ruby
# tab-width: 4
# indent-tabs-mode: nil
# End:
