"Usage:  :open(connection, type) => cord";
"";
"Open a cord between the calling object and something at the other end of the is_player() object given by `connection'.  Return the stub object representing the cord, or raise or return an error.";
{connection, type} = args;
if (!valid(session = $mcp:session_for(connection)))
  return E_INVARG;
elseif (!session:handles_package($mcp.cord))
  return E_INVARG;
elseif (!$object_utils:isa(type, this.type_root))
  return E_INVARG;
endif
cord = $recycler:_create(type.cord_class);
if (typeof(cord) == ERR)
  return $error:raise_or_return(cord);
endif
cord.type = type;
cord.id = tostr("R", this.next_id);
cord.our_side = caller;
"ask `connection' whether it's willing to put up with a new cord.";
if (!`session:cord_open(cord, caller) ! E_VERBNF => 1')
  $recycler:_recycle(cord);
  raise(E_PERM);
endif
cord.session = session;
cord.connection = connection;
res = $mcp.cord:send_open(session, cord.id, $mcp.cord:type_name(type), {"objnum", tostr(cord)});
if (typeof(res) == ERR)
  $recycler:_recycle(cord);
  return $error:raise_or_return(res);
endif
this.next_id = this.next_id + 1;
this.registry_ids = {tostr(cord.id), @this.registry_ids};
this.registry = {cord, @this.registry};
return cord;